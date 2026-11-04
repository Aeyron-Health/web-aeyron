import { Nav } from "./components/Nav";
import { SignalThreadBackground } from "./components/three/SignalThreadBackground";
import { Hero } from "./sections/Hero";
import { Tagline } from "./sections/Tagline";
import { Gap } from "./sections/Gap";
import { Shift } from "./sections/Shift";
import { HowItWorks } from "./sections/HowItWorks";
import { LiveTremor } from "./sections/LiveTremor";
import { WhatYouGet } from "./sections/WhatYouGet";
import { Science } from "./sections/Science";
import { Audiences } from "./sections/Audiences";
import { Roadmap } from "./sections/Roadmap";
import { CTA } from "./sections/CTA";
import { NorthStar } from "./sections/NorthStar";
import { Footer } from "./sections/Footer";
import { currentPublicRoute } from "./publicRoutes";
import { PublicInformationPage } from "./sections/PublicInformationPage";

export default function App() {
  if (currentPublicRoute(window.location.pathname)) {
    return <PublicInformationPage />;
  }

  return (
    <>
      <a
        href="#how-it-works"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      {/* Persistent revolving 3D Signal Thread, behind everything */}
      <SignalThreadBackground />
      <div className="relative z-10">
        <Nav />
        <main id="top">
          <Hero />
          <Tagline />
          <Gap />
          <Shift />
          <HowItWorks />
          <LiveTremor />
          <WhatYouGet />
          <Science />
          <Audiences />
          <Roadmap />
          <CTA />
          <NorthStar />
        </main>
        <Footer />
      </div>
    </>
  );
}
