import { Link } from "react-router-dom";
import PedalPointLogo from "../assets/pedalpoint_logo.png";

function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-base-300 text-base-content p-10">
      <aside>
        <img src={PedalPointLogo} alt="PedalPoint" className="h-12 w-auto" />
        <p>
          PedalPoint
        <br />
          Providing bikes since 20xx
        </p>
      </aside>
      <nav>
        <h6 className="footer-title">Services</h6>
        <Link to="/repair" className="link link-hover">Schedule Repair</Link>
        <Link to="/builder" className="link link-hover">Build</Link>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <Link to="/about" className="link link-hover">About us</Link>
        <Link to="/contact" className="link link-hover">Contact</Link>
      </nav>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <Link to="/terms-of-use" className="link link-hover">Terms of use</Link>
        <Link to="/privacy-policy" className="link link-hover">Privacy policy</Link>
        <Link to="/cookie-policy" className="link link-hover">Cookie policy</Link>
      </nav>
    </footer>
  );
}

export default Footer;