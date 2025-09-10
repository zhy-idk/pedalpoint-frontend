import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();

  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      alert("Login successful!");
      setFormData({ email: "", password: "" });
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex h-fit w-full items-center justify-center py-10">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend text-lg">Login</legend>

        <form onSubmit={handleSubmit}>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </label>

          <button
            className="btn btn-neutral btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4 w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <span>
            Forgot password?
            <Link to="/forgot-password" className="link link-hover mx-1">
              Click me
            </Link>
          </span>

          <div className="mt-2 flex flex-col gap-2 border-t-1 border-gray-600 pt-2">
            <button
              type="button"
              className="btn w-full border-[#e5e5e5] bg-white text-black shadow-xs shadow-[#e5e5e5]"
              disabled={isLoading}
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
        </form>

        <span>
          Don't have an account yet?
          <Link to="/signup" className="link link-hover mx-1">
            Click me
          </Link>
        </span>
      </fieldset>
    </div>
  );
}

export default Login;
