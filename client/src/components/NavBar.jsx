import { Link } from 'react-router-dom';

export function NavBar() {
  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <span className="navbar-brand">LowTix</span>
        <div className="navbar-links">
          <Link className="navbar-link" to="/">
            Home
          </Link>
          <Link className="navbar-link" to="/browse">
            Browse Events
          </Link>
          <Link className="navbar-link" to="/feed">
            For You
          </Link>
          <Link className="navbar-link" to="/orders">
            My Orders
          </Link>
          <Link className="navbar-link" to="/account">
            Account
          </Link>
        </div>
        <div className="navbar-auth">
          <Link className="navbar-link" to="/signin">
            Sign In
          </Link>
          <Link className="navbar-link" to="/signup">
            Sign Up
          </Link>
        </div>
        <div className="navbar-admin">
          <Link className="navbar-link" to="/admin/inventory">
            Admin: Inventory
          </Link>
          <Link className="navbar-link" to="/admin/pricing-rules">
            Admin: Pricing
          </Link>
          <Link className="navbar-link" to="/admin/events">
            Admin: Events
          </Link>
        </div>
      </nav>
    </header>
  );
}
