import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { createFirebaseBackend, setBackend } from "@workspace/api-client-react";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasAllEnvVars = Object.values(config).every((value) => Boolean(value));

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;

if (hasAllEnvVars) {
  app = getApps()[0] ?? initializeApp(config as Record<string, string>);
  dbInstance = getFirestore(app);
  setBackend(createFirebaseBackend(dbInstance));
} else {
  console.warn(
    "[firebase] UI-only mode: missing VITE_FIREBASE_* env vars. Using localStorage-backed stub backend.",
  );

  const STORE_KEY = "by-meesh-stub-v1";
  type StubStore = { events: Array<Record<string, unknown>>; dishes: Array<Record<string, unknown>> };
  const loadStore = (): StubStore => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : { events: [], dishes: [] };
    } catch {
      return { events: [], dishes: [] };
    }
  };
  const saveStore = (data: StubStore) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  };
  const parseParams = (url: string) => {
    const [path, search = ""] = url.split("?");
    return { path, params: new URLSearchParams(search) };
  };

  setBackend({
    async handle(method, url, body) {
      const { path, params } = parseParams(url);
      const store = loadStore();
      const events = store.events as Array<Record<string, unknown>>;
      const dishes = store.dishes as Array<Record<string, unknown>>;
      const bodyObj = (body ?? {}) as Record<string, unknown>;

      // Events
      if (path === "/api/events") {
        if (method === "GET") {
          const status = params.get("status");
          return status ? events.filter((e) => e.status === status) : events;
        }
        if (method === "POST") {
          const newEvent = {
            id: Date.now(),
            ...bodyObj,
            status: "new",
            createdAt: new Date().toISOString(),
          };
          events.push(newEvent);
          saveStore({ events, dishes });
          return newEvent;
        }
      }

      const eventMatch = path.match(/^\/api\/events\/(\d+)(\/menu|\/cost)?$/);
      if (eventMatch) {
        const id = Number(eventMatch[1]);
        const sub = eventMatch[2];
        const idx = events.findIndex((e) => e.id === id);
        if (sub === "/menu") {
          if (method === "GET") return { eventId: id, entries: [] };
          if (method === "PUT") return { eventId: id, entries: (bodyObj.entries ?? []) };
        }
        if (sub === "/cost") {
          return { eventId: id, lines: [], atCost: 0, totalPrice: 0, margin: 0 };
        }
        if (method === "GET") return idx >= 0 ? events[idx] : null;
        if (method === "PUT" && idx >= 0) {
          events[idx] = { ...events[idx], ...bodyObj };
          saveStore({ events, dishes });
          return events[idx];
        }
        if (method === "DELETE" && idx >= 0) {
          events.splice(idx, 1);
          saveStore({ events, dishes });
          return null;
        }
      }

      // Dishes
      if (path === "/api/dishes") {
        if (method === "GET") return dishes;
        if (method === "POST") {
          const newDish = { id: Date.now(), ...bodyObj };
          dishes.push(newDish);
          saveStore({ events, dishes });
          return newDish;
        }
      }
      const dishMatch = path.match(/^\/api\/dishes\/(\d+)$/);
      if (dishMatch) {
        const id = Number(dishMatch[1]);
        const idx = dishes.findIndex((d) => d.id === id);
        if (method === "GET") return idx >= 0 ? dishes[idx] : null;
        if (method === "PUT" && idx >= 0) {
          dishes[idx] = { ...dishes[idx], ...bodyObj };
          saveStore({ events, dishes });
          return dishes[idx];
        }
        if (method === "DELETE" && idx >= 0) {
          dishes.splice(idx, 1);
          saveStore({ events, dishes });
          return null;
        }
      }

      // Dashboard
      if (path === "/api/dashboard/summary" && method === "GET") {
        return {
          totalDishes: dishes.length,
          totalEvents: events.length,
          newEvents: events.filter((e) => e.status === "new").length,
          inProgressEvents: events.filter((e) => e.status === "in_progress").length,
          confirmedEvents: events.filter((e) => e.status === "confirmed").length,
          totalAtCost: 0,
          totalEstimatedRevenue: 0,
          upcomingEvents: events.slice(0, 5),
          ingredientTotals: [],
          supplyTotals: [],
          flatwareRequired: [],
        };
      }

      // Procurement
      if (path === "/api/procurement" && method === "GET") {
        return { ingredients: [], supplies: [], flatware: [] };
      }

      if (method !== "GET") return null;
      return [];
    },
  });
}

export const db = dbInstance;
