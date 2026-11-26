import { Navigate, useNavigate } from "react-router-dom";
import useUser from "./hooks/userUser";

const Home = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/overview" replace />;
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Livestock Health
          </h1>

          <p className="text-muted-foreground">
            A central place to manage your livestock health records and stay
            informed about your animals' wellbeing.
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          Login
        </button>
      </div>
    </main>
  );
};

export default Home;