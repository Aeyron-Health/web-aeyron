import { lazy, Suspense } from "react";
import { currentPublicRoute } from "./publicRoutes";
import { Home } from "./sections/Home";

// The legal and deletion pages pull in the Supabase client; keep it off the home page.
const PublicInformationPage = lazy(() =>
  import("./sections/PublicInformationPage").then(module => ({ default: module.PublicInformationPage })),
);

export default function App() {
  if (currentPublicRoute(window.location.pathname)) {
    return (
      <Suspense fallback={null}>
        <PublicInformationPage />
      </Suspense>
    );
  }
  return <Home />;
}
