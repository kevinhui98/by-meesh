import { useEffect, useRef, lazy, Suspense } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
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

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(22, 65%, 52%)",
    colorForeground: "hsl(20, 25%, 12%)",
    colorMutedForeground: "hsl(20, 15%, 45%)",
    colorDanger: "hsl(0, 70%, 50%)",
    colorBackground: "hsl(38, 30%, 97%)",
    colorInput: "hsl(30, 20%, 85%)",
    colorInputForeground: "hsl(20, 25%, 12%)",
    colorNeutral: "hsl(30, 20%, 85%)",
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-semibold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground",
    formFieldLabel: "text-foreground",
    footerActionLink: "text-primary",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-600",
    alertText: "text-foreground",
    logoBox: "",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border-border bg-card hover:bg-muted",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
    formFieldInput: "bg-background border-input text-foreground",
    footerAction: "",
    dividerLine: "bg-border",
    alert: "border-border bg-accent",
    otpCodeFieldInput: "border-input text-foreground",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
         style={{ backgroundImage: "radial-gradient(ellipse at top, hsl(22 65% 52% / 0.08) 0%, transparent 60%)" }}>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
         style={{ backgroundImage: "radial-gradient(ellipse at top, hsl(22 65% 52% / 0.08) 0%, transparent 60%)" }}>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Suspense fallback={<PageLoader />}>
          <Landing />
        </Suspense>
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <Suspense fallback={<PageLoader />}>
          <Component />
        </Suspense>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function ClerkQueryInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevUserId.current !== undefined && prevUserId.current !== uid) {
        qc.clear();
      }
      prevUserId.current = uid;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/book">
            <Suspense fallback={<PageLoader />}><Book /></Suspense>
          </Route>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard">
            <ProtectedRoute component={Dashboard} />
          </Route>
          <Route path="/inbox">
            <ProtectedRoute component={Inbox} />
          </Route>
          <Route path="/inbox/:id/menu">
            <ProtectedRoute component={MenuCuration} />
          </Route>
          <Route path="/inbox/:id/cost">
            <ProtectedRoute component={CostSummary} />
          </Route>
          <Route path="/inbox/:id">
            <ProtectedRoute component={EventDetail} />
          </Route>
          <Route path="/dishes">
            <ProtectedRoute component={DishLibrary} />
          </Route>
          <Route path="/dishes/:id">
            <ProtectedRoute component={DishDetail} />
          </Route>
          <Route path="/procurement">
            <ProtectedRoute component={Procurement} />
          </Route>
          <Route>
            <Suspense fallback={<PageLoader />}><NotFound /></Suspense>
          </Route>
        </Switch>
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
