import { useState } from "react";
import {
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? "";

  const [code, setCode] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

 const handleGetCode = async () => {
  try {
    setResending(true);

    await resendSignUpCode({
      username: email.trim(),
    });

    setCodeRequested(true);
    toast.success("A confirmation code has been sent to your email.");
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Unable to send confirmation code."
    );
  } finally {
    setResending(false);
  }
};

const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    setLoading(true);

    const result = await confirmSignUp({
      username: email.trim(),
      confirmationCode: code.trim(),
    });

    if (result.isSignUpComplete) {
      toast.success("Email verified successfully. Please sign in.");
     navigate("/login", { replace: true });
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "CodeMismatchException") {
        toast.error("Incorrect confirmation code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
        toast.error("Your confirmation code has expired. Please request a new one.");
      } else if (err.name === "NotAuthorizedException") {
        toast.error("This account may already be confirmed. Please sign in.");
      } else {
        toast.error(err.message);
      }
    } else {
      toast.error("Unable to confirm your account. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

const handleResend = async () => {
  try {
    setResending(true);

    await resendSignUpCode({
      username: email.trim(),
    });

    setCode("");
    toast.success("A new confirmation code has been sent to your email.");
  } catch (err) {
    toast.error(
      err instanceof Error
        ? err.message
        : "Unable to resend confirmation code."
    );
  } finally {
    setResending(false);
  }
};
const handleBackToLogin = () => {
  navigate("/login");
};

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Verify your email
        </h1>

        <p className="mb-6 text-sm text-foreground/70">
          {codeRequested
            ? "We've sent a confirmation code to "
            : "Get a confirmation code sent to "}
          <span className="font-medium text-foreground">{email}</span>
          {codeRequested && ". Enter it below to confirm your account."}
        </p>

        {!codeRequested ? (
          <>


            <button
              type="button"
              onClick={handleGetCode}
              disabled={resending}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? "Sending..." : "Get code"}
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirmation code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter confirmation code"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Confirm account"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading}
              className="mt-4 w-full text-sm text-primary hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend confirmation code"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={loading || resending}
          className="mt-6 w-full text-sm text-foreground/70 hover:underline disabled:opacity-50"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default Otp;