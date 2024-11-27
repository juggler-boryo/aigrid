import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/Index";
import Login from "./pages/login/Index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./pages/profile/Index";
import "./global.css";
import { CssVarsProvider, extendTheme } from "@mui/joy";
const queryClient = new QueryClient();

const theme = extendTheme({
  fontFamily: {
    display: "Iosevka Aile Iaso, Transparent",
    body: "Iosevka Aile Iaso, Transparent",
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
    element: <Profile />,
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
    </QueryClientProvider>
  </CssVarsProvider>
);
