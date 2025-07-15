import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
      <li><Link to="/">Home</Link></li>
      <li>
        <details>
          <summary>Category</summary>
          <ul className="z-10">
            <li><Link to="category/">Bikes</Link></li>
            <li><Link to="category/">Components</Link></li>
            <li><Link to="category/">Miscellaneous</Link></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Services</summary>
          <ul className="z-10">
            <li><Link to="repair/">Repair</Link></li>
            <li><Link to="builder/">Build</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="about/">About</Link></li>
      <li><Link to="contact/">Contact</Link></li>
    </>
  );
}
export default Menu;