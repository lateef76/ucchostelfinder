import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Map, User } from "lucide-react";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface BottomNavigationProps {
  onItemClick?: (path: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onItemClick,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems: NavItem[] = [
    {
      path: "/",
      label: "Home",
      icon: <Home size={24} />,
      activeIcon: <Home size={24} fill="currentColor" />,
    },
    {
      path: "/search",
      label: "Search",
      icon: <Search size={24} />,
    },
    {
      path: "/map",
      label: "Map",
      icon: <Map size={24} />,
    },
    {
      path: "/favorites",
      label: "Favorites",
      icon: <Heart size={24} />,
      activeIcon: <Heart size={24} fill="currentColor" />,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <User size={24} />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onItemClick?.(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full touch-manipulation"
            >
              <div className="relative">
                {/* Icon */}
                <div
                  className={`transition-colors ${
                    isActive ? "text-ucc-blue" : "text-gray-500"
                  }`}
                >
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </div>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-1/2 w-1 h-1 bg-ucc-blue rounded-full"
                    style={{ x: "-50%" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>

              {/* Label (hide on very small screens if needed) */}
              <span
                className={`text-xs mt-1 ${isActive ? "text-ucc-blue font-medium" : "text-gray-500"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Safe area inset for notches (add to your CSS)
const styles = `
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

// Add to existing style sheet or create new
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
