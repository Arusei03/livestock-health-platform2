
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import useUser from "../hooks/userUser";
import App from "../App"

// Import page components
import Login from "../modules/auth/login/page";
import Signup from "../modules/auth/signup/page";
import Otp from "../modules/auth/otp/page";

// Import layouts
import AppLayout from "../layout/AppLayout";
import AuthLayout from "../layout/AuthLayout";
import ForgotPassword from "../modules/auth/forgot-password/page";
import { useEffect } from "react";
import { toast } from "sonner";
import Overview from "../modules/overview/page";

const GuestRoute = () => {
  return <Outlet />;
};

const ProtectedRoute = () => {
  const { user, isLoading, isError, error } = useUser();

  useEffect(() => {
    if (!isError) return;

    const message = error instanceof Error
      ? error.message
      : "Unable to retrieve your profile.";

    toast.error(message);
  }, [isError, error]);

  if (isLoading) return <div>Loading...</div>;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


export const router = createBrowserRouter([
{
  path: "/",
  element: <App />,
},
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "verify", element: <Otp /> },
        ],
      },
    ],
  },
  {
    path: "/overview",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
           { index: true, element: <Overview /> },
          { path: "animals", element: <div>Animals</div> },
          { path: "animals/:animalId", element: <div>Animal Profile</div> },
          { path: "profile", element: <div>Profile</div> },
        ],
      },
    ],
  },
]);
