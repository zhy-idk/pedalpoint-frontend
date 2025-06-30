
function Login() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
      <legend className="fieldset-legend text-lg">Login</legend>

      <label className="floating-label">
        <span>Email</span>
        <input type="text" placeholder="mail@site.com" className="input input-md" />
      </label>

      <label className="floating-label mt-2">
        <span>Password</span>
        <input type="password" placeholder="password" className="input input-md" />
      </label>

      <button className="btn btn-neutral mt-4 btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Login</button>
      </fieldset>
    </div>
  );
}
export default Login;