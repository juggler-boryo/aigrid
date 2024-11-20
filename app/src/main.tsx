import { createRoot } from "react-dom/client";
import "@fontsource/inter";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/index";
import Login from "./pages/login/Index";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
