
function Login() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend className="fieldset-legend text-lg">Login</legend>

      <label className="label">Email</label>
      <input type="email" className="input" placeholder="Email" />

      <label className="label">Password</label>
      <input type="password" className="input" placeholder="Password" />

      <button className="btn btn-neutral mt-4 btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Login</button>
      </fieldset>
    </div>
  );
}
export default Login;