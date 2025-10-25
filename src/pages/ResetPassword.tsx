import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/index";
import { fetchCSRFToken } from "../api/auth";
import { getCSRFToken } from "../utils/csrf";

function ResetPassword() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validatingKey, setValidatingKey] = useState(true);
  const [keyValid, setKeyValid] = useState(false);

  // Validate the reset key on mount
  useEffect(() => {
    const validateKey = async () => {
      if (!key) {
        setError("Invalid password reset link - missing key");
        setValidatingKey(false);
        setKeyValid(false);
        return;
      }

      // For django-allauth, there's no separate key validation endpoint
      // The key is validated when you POST to reset the password
      // So we just check if the key exists in the URL and assume it's valid
      // If it's invalid, the POST request will fail with an appropriate error
      
      setKeyValid(true);
      setValidatingKey(false);
    };

    validateKey();
  }, [key]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (passwords.password !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (passwords.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure we have CSRF token
      await fetchCSRFToken();
      const token = getCSRFToken();

      if (!token) {
        throw new Error('Unable to get CSRF token');
      }

      // Reset password using allauth headless API
      await api.post(
        '/_allauth/browser/v1/auth/password/reset',
        {
          key: key,
          password: passwords.password,
        },
        {
          withCredentials: true,
        }
      );

      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error("Password reset failed:", error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Password reset failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating key
  if (validatingKey) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid key
  if (!keyValid && !validatingKey) {
    return (
      <div className="flex h-fit w-full items-center justify-center py-10">
        <div className="card bg-base-100 border-base-300 w-96 border shadow-lg">
          <div className="card-body text-center">
            <div className="bg-error/20 rounded-full p-4 mb-4 mx-auto w-fit">
              <svg 
                className="w-16 h-16 text-error" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h2 className="card-title text-error justify-center">Invalid Link</h2>
            <p className="text-base-content/70">
              {error || "This password reset link is invalid or has expired."}
            </p>
            
            <div className="card-actions justify-center mt-4">
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Link
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex h-fit w-full items-center justify-center py-10">
        <div className="modal modal-open">
          <div className="modal-box border-2 border-success max-w-md">
            <div className="flex flex-col items-center text-center">
              <div className="bg-success/20 rounded-full p-4 mb-4 animate-bounce">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h3 className="font-bold text-2xl text-success mb-2">Password Reset Successful! 🎉</h3>
              <p className="text-base-content/70 mb-4">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              
              <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Redirecting to login...</span>
              </div>

              <Link to="/login" className="btn btn-primary w-full">
                Go to Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="flex h-fit w-full items-center justify-center py-10">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend text-lg">Reset Password</legend>

        <div className="mb-4 text-center">
          <p className="text-base-content/70 text-sm">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="floating-label">
            <span>New Password</span>
            <input
              className="input validator"
              type="password"
              name="password"
              value={passwords.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </label>

          <label className="floating-label mt-2">
            <span>Confirm New Password</span>
            <input
              className="input validator"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Re-enter new password"
              disabled={isLoading}
            />
          </label>

          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-xs">
              <p className="font-semibold">Password Requirements:</p>
              <ul className="list-disc list-inside mt-1">
                <li>At least 8 characters long</li>
                <li>Must match confirmation</li>
              </ul>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4 w-full"
            type="submit"
            disabled={isLoading || !passwords.password || !passwords.confirmPassword}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
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
      </fieldset>
    </div>
  );
}

export default ResetPassword;

