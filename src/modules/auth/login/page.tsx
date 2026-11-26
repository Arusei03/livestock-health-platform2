
import { useState } from "react";
import { fetchAuthSession, getCurrentUser, signIn,signOut } from "aws-amplify/auth";
import { toast } from "sonner";
import { userAxios } from "../../../packages/axioxinstance";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLoginSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/overview", { replace: true });
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleVerificationRequired = (email: string) => {
    navigate("/verify", {
      state: { email },
    });
  };
const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    setLoading(true);

    const enteredEmail = email.trim().toLowerCase();

    // 1. Check for an existing session
    const existingSession = await fetchAuthSession();

    if (existingSession.tokens?.accessToken) {
      try {
        // Check whether the existing session can still be refreshed
        const refreshedSession = await fetchAuthSession({
          forceRefresh: true,
        });

        if (!refreshedSession.tokens?.accessToken) {
          throw new Error("Existing session is no longer valid.");
        }

        const currentUser = await getCurrentUser();

        const currentEmail =
          currentUser.signInDetails?.loginId?.toLowerCase();

        // 2. Same account is already signed in
        if (currentEmail === enteredEmail) {
          const accessToken =
            refreshedSession.tokens.accessToken.toString();

          await userAxios.post(
            "/api/confirm-profile",
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          toast.info("You're already signed in.");
          handleLoginSuccess();
          return;
        }

        // 3. Different account: sign out before switching
        await signOut();
        queryClient.removeQueries({ queryKey: ["user"] });

      } catch (sessionError) {
        console.error("Existing session validation failed:", sessionError);

        // Clear the invalid local session
        await signOut();
        queryClient.removeQueries({ queryKey: ["user"] });
      }
    }

    // 4. Sign in with the entered credentials
    const result = await signIn({
      username: email.trim(),
      password,
    });

    // 5. Handle unconfirmed accounts
    if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
      handleVerificationRequired(email.trim());
      return;
    }

    // 6. Handle additional authentication steps
    if (!result.isSignedIn) {
      toast.error(
        `Additional sign-in step required: ${result.nextStep.signInStep}`
      );
      return;
    }

    // 7. Retrieve access token
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken) {
      throw new Error("Access token unavailable.");
    }

    // 8. Confirm or create the application profile
    const response = await userAxios.post(
      "/api/confirm-profile",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("User profile response:", response.data);

    // 9. Enter the application
    await queryClient.invalidateQueries({ queryKey: ["user"] });

    toast.success("Signed in successfully!");
    handleLoginSuccess();

  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "UserNotConfirmedException") {
        handleVerificationRequired(email.trim());

      } else if (err.name === "UserNotFoundException") {
        toast.error("No account found with this email address.");

      } else if (err.name === "NotAuthorizedException") {
        toast.error("Invalid email or password. Please check your details and try again.");
        
      } else if (err.name === "UserAlreadyAuthenticatedException") {
        toast.error("An existing session is active. Please try again.");

      } else {
        console.error("Sign-in error:", err);
        toast.error(err.message);
      }
    } else {
      toast.error("Unable to sign in. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Sign in
        </h1>

        <p className="mb-6 text-sm text-foreground/70">
          Welcome back. Sign in to your account.
        </p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              autoComplete="email"
              required
            />
          </div>

         <div>
  <label className="mb-2 block text-sm font-medium">
    Password
  </label>

  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
    autoComplete="current-password"
    required
  />
</div>

<div className="flex justify-end">
  <Link
    to="/forgot-password"
    className="text-sm font-medium text-primary hover:underline"
  >
    Forgot password?
  </Link>
</div>

<label className="flex items-center gap-2 text-sm text-foreground/70">
  <input
    type="checkbox"
    checked={showPassword}
    onChange={(e) => setShowPassword(e.target.checked)}
    className="accent-primary"
  />
  Show password
</label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={handleSignUp}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
