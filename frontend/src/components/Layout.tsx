import { NavLink, Outlet } from "react-router-dom";
import { FaHome, FaCar, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span>Location</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FaHome className="nav-icon" />
            Accueil
          </NavLink>

          <NavLink
            to="/voitures"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FaCar className="nav-icon" />
            Voitures
          </NavLink>

          <NavLink
            to="/reservations"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FaCalendarAlt className="nav-icon" />
            Réservations
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FaMoneyBillWave className="nav-icon" />
            Transactions
          </NavLink>

        </nav>
      </aside>

      {/* CONTENT */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
