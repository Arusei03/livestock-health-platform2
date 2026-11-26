
import { useState } from "react";
import { signUp } from "aws-amplify/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleVerificationRequired = (email: string) => {
    navigate("/verify", {
      state: { email },
    });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const result = await signUp({
      username: email.trim(),
      password,
      options: {
        userAttributes: {
          email: email.trim(),
          name: name.trim(),
        },
      },
    });

    if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      toast.success("Account created successfully. Please verify your email.");
      handleVerificationRequired(email.trim());
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "UsernameExistsException") {
        toast.error("An account with this email already exists. Please sign in.");
      } else {
        toast.error(err.message);
      }
    } else {
      toast.error("Unable to create your account. Please try again later.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Sign up
        </h1>

        <p className="mb-6 text-sm text-foreground/70">
          Create a new account.
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              autoComplete="name"
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
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              autoComplete="new-password"
              required
            />
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Have an account already?{" "}
          <button
            type="button"
            onClick={handleSignIn}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
