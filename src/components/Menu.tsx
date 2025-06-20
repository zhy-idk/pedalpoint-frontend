import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
      <li><Link to="/">Home</Link></li>
      <li>
        <details>
          <summary>Products</summary>
          <ul>
            <li><Link to="/">Link 1</Link></li>
            <li><Link to="">Link 2</Link></li>
          </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>Services</summary>
          <ul>
            <li><Link to="/">Repair</Link></li>
            <li><Link to="builder/">Build</Link></li>
          </ul>
        </details>
      </li>
      <li><Link to="about/">About</Link></li>
      <li><Link to="/">Contact</Link></li>

    </>
  );
}
export default Menu;