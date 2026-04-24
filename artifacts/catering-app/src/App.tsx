import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";

const Landing = lazy(() => import("@/pages/Landing"));
const Book = lazy(() => import("@/pages/Book"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Inbox = lazy(() => import("@/pages/inbox/Inbox"));
const EventDetail = lazy(() => import("@/pages/inbox/EventDetail"));
const MenuCuration = lazy(() => import("@/pages/inbox/MenuCuration"));
const CostSummary = lazy(() => import("@/pages/inbox/CostSummary"));
const DishLibrary = lazy(() => import("@/pages/dishes/DishLibrary"));
const DishDetail = lazy(() => import("@/pages/dishes/DishDetail"));
const Procurement = lazy(() => import("@/pages/Procurement"));
const NotFound = lazy(() => import("@/pages/not-found"));

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Page({ component: Component }: { component: React.ComponentType<Record<string, never>> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/"><Page component={Landing} /></Route>
      <Route path="/book"><Page component={Book} /></Route>
      <Route path="/dashboard"><Page component={Dashboard} /></Route>
      <Route path="/inbox"><Page component={Inbox} /></Route>
      <Route path="/inbox/:id/menu"><Page component={MenuCuration} /></Route>
      <Route path="/inbox/:id/cost"><Page component={CostSummary} /></Route>
      <Route path="/inbox/:id"><Page component={EventDetail} /></Route>
      <Route path="/dishes"><Page component={DishLibrary} /></Route>
      <Route path="/dishes/:id"><Page component={DishDetail} /></Route>
      <Route path="/procurement"><Page component={Procurement} /></Route>
      <Route><Page component={NotFound} /></Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <Routes />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
