import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Store, Tag, Bell, Lightbulb
} from "lucide-react";

const links = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/forecast",  icon: TrendingUp,      label: "Forecast"   },
  { to: "/stores",    icon: Store,           label: "Stores"     },
  { to: "/promos",    icon: Tag,             label: "Promotions" },
  { to: "/alerts",    icon: Bell,            label: "Alerts"     },
  { to: "/insights",  icon: Lightbulb,       label: "AI Insights"},
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">📦 DemandIQ</div>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
