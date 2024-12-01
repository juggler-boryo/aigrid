import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/Index";
import Login from "./pages/login/Index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileSettings from "./pages/profile/Index";
import "./global.css";
import { Box, CssVarsProvider, extendTheme, CircularProgress } from "@mui/joy";
import Profile from "./pages/profile/uid/Index";
import TamakiNew from "./pages/tamaki/new/Index";
import { lazy, Suspense } from "react";

const TamakiDetail = lazy(() => import("./pages/tamaki/id/Index"));
const InOutAnal = lazy(() => import("./pages/inout/anal/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      cacheTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
    },
  },
});

const theme = extendTheme({
  fontFamily: {
    display: "Iosevka Aile Iaso, Transparent",
    body: "Iosevka Aile Iaso, Transparent",
  },
  radius: {
    sm: "16px",
    md: "16px",
    lg: "16px",
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/profile",
    element: <ProfileSettings />,
  },
  {
    path: "/profile/:uid",
    element: <Profile />,
  },
  {
    path: "/tamaki/new",
    element: <TamakiNew />,
  },
  {
    path: "/tamaki/:id",
    element: (
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        }
      >
        <TamakiDetail />
      </Suspense>
    ),
  },
  {
    path: "/inout/anal",
    element: (
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        }
      >
        <InOutAnal />
      </Suspense>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <CssVarsProvider theme={theme} defaultMode="light">
    <QueryClientProvider client={queryClient}>
      <link
        rel="stylesheet"
        href="https://cdn.xeiaso.net/static/css/iosevka/family.css"
      />
      <RouterProvider router={router} />
      <Box sx={{ mb: 8 }} />
    </QueryClientProvider>
  </CssVarsProvider>
);
