import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/index";

function Login() {
  const navigate = useNavigate();

  const { login, isLoading, error, clearError, isAuthenticated, handleSocialLogin, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // TOTP/MFA state
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState<string | null>(null);
  const [isSubmittingTotp, setIsSubmittingTotp] = useState(false);

  // Redirect to home if user is already authenticated (but not during login process)
  useEffect(() => {
    if (isAuthenticated && !isLoggingIn) {
      console.log('Already authenticated, redirecting to home');
      navigate("/");
    }
  }, [isAuthenticated, navigate, isLoggingIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    setShowEmailVerificationModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await login(formData.email, formData.password);
      console.log('Login successful, checkAuth completed');
      setFormData({ email: "", password: "" });
      setShowSuccessModal(true);
      
      // Small delay to ensure state propagation, then navigate
      setTimeout(() => {
        console.log('Navigating to home after successful login');
        setIsLoggingIn(false);
        // Force a small delay to ensure context update propagates
        setTimeout(() => {
          navigate("/");
        }, 100);
      }, 1500);
    } catch (error: any) {
      setIsLoggingIn(false);
      console.error("Login failed:", error);
      
      const status = error?.response?.status;
      
      // Check for 400: Invalid credentials
      if (status === 400) {
        // Error message is already set in AuthProvider, it will show in the error display below
        return;
      }
      
      // Check for 409: Already logged in
      if (status === 409) {
        // Error message is already set in AuthProvider, it will show in the error display below
        return;
      }
      
      // Check for 401 status code (MFA or email verification)
      if (status === 401) {
        const responseData = error?.response?.data;
        
        // Check for MFA flow first
        if (responseData?.data?.flows) {
          const flows = responseData.data.flows;
          const mfaFlow = flows.find((flow: any) => flow.id === 'mfa_authenticate');
          
          if (mfaFlow?.is_pending) {
            // MFA is required, show TOTP modal
            setShowTotpModal(true);
            return;
          }
        }
        
        // If 401 but no MFA flow, it's likely an unverified email
        // Show email verification modal
        setShowEmailVerificationModal(true);
      }
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totpCode.trim()) {
      setTotpError("Please enter your authentication code");
      return;
    }

    setIsSubmittingTotp(true);
    setTotpError(null);

    try {
      const response = await api.post('/_allauth/browser/v1/auth/2fa/authenticate', {
        code: totpCode
      });

      console.log('2FA authentication successful:', response.data);

      // Check if the response indicates user is now authenticated
      if (response.data?.meta?.is_authenticated || response.data?.status === 200) {
        console.log('User authenticated after 2FA, updating auth state...');
        
        // Update authentication state by calling checkAuth
        await checkAuth();
        console.log('Auth state updated after 2FA');
      }

      // Success! Clear everything and show success modal
      setTotpCode("");
      setShowTotpModal(false);
      
      // Small delay to ensure modal closes smoothly before showing success
      setTimeout(() => {
        setShowSuccessModal(true);
        setIsLoggingIn(false);
        
        // Navigate after showing success modal
        setTimeout(() => {
          console.log('Navigating to home after 2FA success');
          navigate("/");
        }, 2000);
      }, 300);
    } catch (error: any) {
      console.error("TOTP verification failed:", error);
      const errorMsg = error?.response?.data?.errors?.[0]?.message || 
                      error?.response?.data?.message || 
                      'Invalid code. Please try again.';
      setTotpError(errorMsg);
    } finally {
      setIsSubmittingTotp(false);
    }
  };

  return (
    <div className="flex h-fit w-full items-center justify-center py-10">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend text-lg">Login</legend>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <label className="floating-label">
            <span>Email</span>
            <input
              className="input validator"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="mail@site.com"
              disabled={isLoading || isLoggingIn}
            />
          </label>

          <label className="floating-label mt-2">
            <span>Password</span>
            <input
              className="input validator"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={isLoading || isLoggingIn}
            />
          </label>

          <button
            className="btn btn-neutral btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4 w-full"
            type="submit"
            disabled={isLoading || isLoggingIn}
          >
            {isLoading || isLoggingIn ? "Logging in..." : "Login"}
          </button>

          <span>
            Forgot password?
            <Link to="/forgot-password" className="link link-hover mx-1">
              Click me
            </Link>
          </span>
        </form>
        
        <div className="mt-2 flex flex-col gap-2 border-t-1 border-gray-600 pt-2">
            <button
              type="button"
              className="btn w-full border-[#e5e5e5] bg-white text-black shadow-xs shadow-[#e5e5e5]"
              disabled={isLoading}
              onClick={() => handleSocialLogin("google")}
            >
              <svg
                aria-label="Google logo"
                width="16"
                height="16"
                viewBox="0 0 512 512"
              >
                <g>
                  <path fill="#fff" d="m0 0H512V512H0" />
                  <path
                    fill="#34a853"
                    d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                  />
                  <path
                    fill="#4285f4"
                    d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                  />
                  <path
                    fill="#fbbc02"
                    d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                  />
                  <path
                    fill="#ea4335"
                    d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                  />
                </g>
              </svg>
              Login with Google
            </button>

            <button
              type="button"
              className="btn w-full border-[#005fd8] bg-[#1A77F2] text-white shadow-xs shadow-[#005fd8]"
              disabled={isLoading}
              onClick={() => handleSocialLogin("facebook")}
            >
              <svg
                aria-label="Facebook logo"
                width="16"
                height="16"
                viewBox="0 0 32 32"
              >
                <path
                  fill="white"
                  d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"
                />
              </svg>
              Login with Facebook
            </button>
          </div>

        <span>
          Don't have an account yet?
          <Link to="/signup" className="link link-hover mx-1">
            Click me
          </Link>
        </span>
      </fieldset>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box border-2 border-success">
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
              
              <h3 className="font-bold text-2xl text-success mb-2">Login Successful! 🎉</h3>
              <p className="text-base-content/70 mb-4">
                Welcome back! Redirecting you to home page...
              </p>
              
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex flex-col items-center text-center">
              <div className="bg-warning/20 rounded-full p-4 mb-4">
                <svg 
                  className="w-12 h-12 text-warning" 
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
              
              <h3 className="font-bold text-xl mb-2">Email Not Verified</h3>
              <p className="text-base-content/70 mb-4">
                Please verify your email address before logging in.
              </p>
              
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-left text-sm">
                  <p className="font-semibold">Check your email!</p>
                  <p>We sent a verification link to <strong>{formData.email}</strong></p>
                </div>
              </div>

              <p className="text-sm text-base-content/60 mb-4">
                Click the link in the email to verify your account. Don't forget to check your spam folder!
              </p>

              <div className="modal-action w-full">
                <button 
                  className="btn btn-primary flex-1"
                  onClick={() => setShowEmailVerificationModal(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowEmailVerificationModal(false)}></div>
        </div>
      )}

      {/* TOTP/2FA Modal */}
      {showTotpModal && (
        <div className="modal modal-open">
          <div className="modal-box border-2 border-primary">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/20 rounded-full p-4 mb-4">
                <svg 
                  className="w-16 h-16 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              
              <h3 className="font-bold text-2xl text-primary mb-2">Two-Factor Authentication 🔒</h3>
              <p className="text-base-content/70 mb-4">
                Enter the 6-digit code from your authenticator app
              </p>

              <form onSubmit={handleTotpSubmit} className="w-full">
                {totpError && (
                  <div className="alert alert-error mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{totpError}</span>
                  </div>
                )}

                <div className="form-control mb-4">
                  <input
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => {
                      setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setTotpError(null);
                    }}
                    maxLength={6}
                    className="input input-bordered input-lg text-center text-2xl tracking-widest font-mono"
                    autoFocus
                    disabled={isSubmittingTotp}
                  />
                  <label className="label">
                    <span className="label-text-alt">Enter the code from your authenticator app</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    className="btn btn-ghost flex-1"
                    onClick={() => {
                      setShowTotpModal(false);
                      setTotpCode("");
                      setTotpError(null);
                    }}
                    disabled={isSubmittingTotp}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isSubmittingTotp || totpCode.length !== 6}
                  >
                    {isSubmittingTotp ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </form>

              <div className="alert alert-info mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-left text-xs">
                  <p>Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code shown</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop"></div>
        </div>
      )}
    </div>
  );
}

export default Login;
