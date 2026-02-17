import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div style={{ background: "#222", padding: "10px" }}>
      <Link to="/" style={{ color: "white", marginRight: "15px" }}>
        Dashboard
      </Link>

      <Link to="/users" style={{ color: "white", marginRight: "15px" }}>
        Users
      </Link>

      <Link to="/expenses" style={{ color: "white" }}>
        Expenses
      </Link>
    </div>
  );
}

export default Navbar;
