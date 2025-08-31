import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
      <li><Link to="/">Home</Link></li>
      <li>
        <details>
          <summary>Category</summary>
          <ul className="z-10">
            <li><Link to="/category/bikes">Bikes</Link></li>
            <li><Link to="/category/components">Components</Link></li>
            <li><Link to="/category/miscellaneous">Miscellaneous</Link></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Services</summary>
          <ul className="z-10">
            <li><Link to="/repair">Schedule Repair</Link></li>
            <li><Link to="/builder">Build</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="/about">About</Link></li>
      <li><Link to="/contact">Contact</Link></li>
    </>
  );
}
export default Menu;