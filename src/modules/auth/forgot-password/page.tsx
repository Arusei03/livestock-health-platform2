
import { useState, type FormEvent } from "react";
import {
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword({ username: email.trim() });

      setStep("reset");
      toast.success("Verification code sent to your email.");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Unable to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword: password,
      });

      toast.success("Password reset successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Confirm password reset error:", error);
      toast.error("Unable to reset password. Check your code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {step === "email" ? "Forgot your password?" : "Create a new password"}
        </h1>

        <p className="mt-2 text-sm text-foreground/60">
          {step === "email"
            ? "Enter your registered email address and we'll send you a verification code."
            : `Enter the verification code sent to ${email} and choose a new password.`}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Verification code
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className={inputClass}
            />
          </div>

         <div>
  <label className="mb-2 block text-sm font-medium text-foreground">
    New password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      autoComplete="new-password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter new password"
      className={`${inputClass} pr-12`}
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
       </div>

<div>
  <label className="mb-2 block text-sm font-medium text-foreground">
    Confirm new password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      autoComplete="new-password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm new password"
      className={`${inputClass} pr-12`}
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  {confirmPassword && password !== confirmPassword && (
    <p className="mt-1 text-sm text-red-500">
      Passwords do not match.
    </p>
  )}
</div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-sm font-medium text-primary hover:underline"
          >
            Change email address
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-foreground/60">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
