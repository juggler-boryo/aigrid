import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/Index";
import Login from "./pages/login/Index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileSettings from "./pages/profile/Index";
import "./global.css";
import { Box, CssVarsProvider, extendTheme } from "@mui/joy";
import Profile from "./pages/profile/uid/Index";
import TamakiNew from "./pages/tamaki/new/Index";
import TamakiDetail from "./pages/tamaki/id/Index";
import InOutAnal from "./pages/inout/anal/Index";
const queryClient = new QueryClient();

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
    element: <TamakiDetail />,
  },
  {
    path: "/inout/anal",
    element: <InOutAnal />,
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
