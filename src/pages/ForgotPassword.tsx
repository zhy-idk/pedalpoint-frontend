import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ForgotPassword() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex h-fit w-full items-center justify-center py-10">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
          <legend className="fieldset-legend text-lg">Password Reset Sent</legend>
          
          <div className="text-center py-4">
            <div className="text-success text-6xl mb-4">✉️</div>
            <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
            <p className="text-base-content/70 mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-base-content/60 mb-6">
              If you don't see the email, check your spam folder or try again with a different email address.
            </p>
            
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  clearError();
                }}
                className="btn btn-ghost btn-sm"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full items-center justify-center py-10">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend text-lg">Forgot Password</legend>

        <div className="mb-4 text-center">
          <p className="text-base-content/70 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="floating-label">
            <span>Email</span>
            <input
              className="input validator"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="mail@site.com"
              disabled={isLoading}
            />
          </label>

          <button
            className="btn btn-primary btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4 w-full"
            type="submit"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm text-base-content/70">
            Remember your password?{" "}
            <Link to="/login" className="link link-hover">
              Back to Login
            </Link>
          </span>
        </div>

        <div className="mt-2 text-center">
          <span className="text-sm text-base-content/70">
            Don't have an account?{" "}
            <Link to="/signup" className="link link-hover">
              Sign up
            </Link>
          </span>
        </div>
      </fieldset>
    </div>
  );
}

export default ForgotPassword;
