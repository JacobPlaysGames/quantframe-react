import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppContext } from "@contexts/app.context";
import { useAuthContext } from "@contexts/auth.context";
import { Loader } from "@mantine/core";

// Layouts
import { LogInLayout } from "./LogIn";
import { LogOutLayout } from "./LogOut";

// Permissions Gate
import AuthenticatedGate from "../AuthenticatedGate";

// Lazy-loaded routes for better performance
const PHome = lazy(() => import("@pages/home"));
const PLogin = lazy(() => import("@pages/auth/login"));
const PDebug = lazy(() => import("@pages/debug"));
const PError = lazy(() => import("@pages/error"));
const PBanned = lazy(() => import("@pages/banned"));
const PLiveScraper = lazy(() => import("@pages/live_scraper"));
const TradingAnalyticsPage = lazy(() => import("@pages/trading_analytics"));
const PWarframeMarket = lazy(() => import("@pages/warframe_market"));
const PWarframeMarketChat = lazy(() => import("@pages/chat"));
const AboutPage = lazy(() => import("@pages/about"));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Loader size="xl" />
  </div>
);

export function AppRoutes() {
  const { app_error } = useAppContext();
  const { user } = useAuthContext();

  const ShowErrorPage = () => {
    if (!app_error) return false;
    if (app_error.isWebSocket()) return false; // Show error page only for non-WebSocket errors
    return true;
  };

  const IsUserBanned = () => {
    if (!user) return false;
    if (user.anonymous) return false;
    if (user.qf_banned || user.wfm_banned) return true;
    return false;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {!ShowErrorPage() && !IsUserBanned() && (
            <>
              <Route element={<AuthenticatedGate exclude goTo="/" />}>
                <Route path="/auth" element={<LogOutLayout />}>
                  <Route path="login" element={<PLogin />} />
                </Route>
              </Route>
              <Route path="/" element={<LogInLayout />}>
                <Route element={<AuthenticatedGate goTo="/auth/login" />}>
                  <Route path="/" element={<PHome />} />
                  <Route path="debug">
                    <Route index element={<PDebug />} />
                  </Route>
                  <Route path="live_scraper" element={<PLiveScraper />} />
                  <Route path="warframe-market" element={<PWarframeMarket />} />
                  <Route path="chat" element={<PWarframeMarketChat />} />
                  <Route path="trading_analytics" element={<TradingAnalyticsPage />} />
                  <Route path="about" element={<AboutPage />} />
                </Route>
                <Route path="*" element={<PHome />} />
              </Route>
            </>
          )}
          {ShowErrorPage() && (
            <Route path="*" element={<LogOutLayout />}>
              <Route path="*" element={<PError />} />
            </Route>
          )}
          {IsUserBanned() && (
            <Route path="*" element={<LogOutLayout />}>
              <Route path="*" element={<PBanned />} />
            </Route>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
