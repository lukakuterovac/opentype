import { NavLink } from "react-router-dom";

export function Nav(): JSX.Element {
  return (
    <nav className="app-nav" aria-label="Primary">
      <NavLink to="/" className="app-nav-logo">
        open<span>type</span>
      </NavLink>
      <div className="app-nav-tabs">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `app-nav-tab${isActive ? " active" : ""}`
          }
        >
          test
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `app-nav-tab${isActive ? " active" : ""}`
          }
        >
          settings
        </NavLink>
      </div>
      <div className="app-nav-right">guest</div>
    </nav>
  );
}
