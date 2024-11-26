import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/Index";
import Login from "./pages/login/Index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./pages/profile/Index";

const queryClient = new QueryClient();

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
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
