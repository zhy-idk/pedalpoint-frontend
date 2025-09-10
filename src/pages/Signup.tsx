import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);
  const { signup, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setShowHint(true);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.confirmPassword);
      alert("Signup successful!");
      setFormData({ email: "", password: "", confirmPassword: "" });
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };
  return (
    <div className="flex h-fit w-full items-center justify-center py-10">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend text-lg">Signup</legend>

        <form onSubmit={handleSubmit}>
          <label className="floating-label">
            <span>Email</span>
            <input
              className="input validator"
              type="email"
              name="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="validator-hint hidden">
              Enter valid email address
            </div>
          </label>

          <label className="floating-label mt-2">
            <span>Password</span>
            <input
              type="password"
              name="password"
              className="input validator"
              required
              placeholder="Password"
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="validator-hint hidden">
              Must be more than 8 characters, including
              <br />
              At least one number
              <br />
              At least one lowercase letter
              <br />
              At least one uppercase letter
            </p>
          </label>

          <label className="floating-label mt-2">
            <span>Confirm Password</span>
            <input
              className="input validator"
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className={showHint ? "text-red-500" : "hidden"}>
              Passwords doesn't match
            </div>
          </label>

          <button className="btn btn-neutral btn-sm md:btn-md lg:btn-lg xl:btn-xl mt-4 w-full">
            Signup
          </button>

          <div className="mt-2 flex flex-col gap-2 border-t-1 border-gray-600 pt-2">
            <button className="btn w-full border-[#e5e5e5] bg-white text-black shadow-xs shadow-[#e5e5e5]">
              <svg
                aria-label="Google logo"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <g>
                  <path d="m0 0H512V512H0" fill="#fff"></path>
                  <path
                    fill="#34a853"
                    d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                  ></path>
                  <path
                    fill="#4285f4"
                    d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                  ></path>
                  <path
                    fill="#fbbc02"
                    d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                  ></path>
                  <path
                    fill="#ea4335"
                    d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                  ></path>
                </g>
              </svg>
              Signup with Google
            </button>

            <button className="btn w-full border-[#005fd8] bg-[#1A77F2] text-white shadow-xs shadow-[#005fd8]">
              <svg
                aria-label="Facebook logo"
                width="16"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
              >
                <path
                  fill="white"
                  d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"
                ></path>
              </svg>
              Signup with Facebook
            </button>
          </div>
        </form>

        <span className="">
          Have an account already?
          <Link to="/login" className="link link-hover mx-1">
            Click me
          </Link>
        </span>
      </fieldset>
    </div>
  );
}
export default Signup;
