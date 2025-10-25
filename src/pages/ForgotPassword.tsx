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
      <>
        <div className="flex h-fit w-full items-center justify-center py-10">
          <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg opacity-50">
            <legend className="fieldset-legend text-lg">Forgot Password</legend>
            <div className="text-center py-20">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </fieldset>
        </div>

        {/* Success Modal */}
        <div className="modal modal-open">
          <div className="modal-box border-2 border-success max-w-md">
            <div className="flex flex-col items-center text-center">
              <div className="bg-success/20 rounded-full p-4 mb-4">
                <svg 
                  className="w-16 h-16 text-success" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              
              <h3 className="font-bold text-2xl text-success mb-2">Check Your Email! 📧</h3>
              <p className="text-base-content/70 mb-4">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-lg text-primary mb-4">{email}</p>
              
              <div className="alert alert-info mb-4 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-sm">
                  <p className="font-semibold">Important:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Check your spam folder</li>
                    <li>Link expires in 24 hours</li>
                    <li>Click the link to reset your password</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Link to="/login" className="btn btn-primary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
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
          </div>
        </div>
      </>
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
