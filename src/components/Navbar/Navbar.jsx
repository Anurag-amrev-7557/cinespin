import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getFromCache, setToCache } from "../../utils/cache"; // adjust path if needed
import { FaChevronDown } from "react-icons/fa6";
import "./Navbar.css";

const SearchItem = ({ item, isActive, onClick }) => (
  <div className={`searchitem ${isActive ? "active" : ""}`} onClick={onClick}>
    {item}
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef();
  const popupRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [activeItem, setActiveItem] = useState("Movies");
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("region") || "Global");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("darkMode") === "true" || localStorage.getItem("darkMode") === null
  );

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    localStorage.setItem("region", region);
    setIsPopupOpen(false);
    window.dispatchEvent(new Event("regionChange"));
    // Remove the reload
    // window.location.reload();
  };

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > 100);
  }, []);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setIsPopupOpen(false);
    }
  };

  const handleClick = (item) => {
    setActiveItem(item);
    const routes = {
      Movies: "/movies",
      Series: "/series",
      Originals: "/originals",
      "What to Watch": "/watch",
    };
    navigate(routes[item]);
  };

  // Sync dark mode with localStorage and class toggles
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
    document.body.classList.add("transition");
    document.body.classList.toggle("dark-mode", isDarkMode);
    const searchBar = document.querySelector(".navbar-search");
    if (searchBar) searchBar.classList.toggle("dark-mode", isDarkMode);
    const timeout = setTimeout(() => document.body.classList.remove("transition"), 200);
    return () => clearTimeout(timeout);
  }, [isDarkMode]);

  // Sync active item with route
  useEffect(() => {
    const pathMap = {
      "/movies": "Movies",
      "/series": "Series",
      "/originals": "Originals",
      "/watch": "What to Watch",
    };
    setActiveItem(pathMap[location.pathname] || "Movies");
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleScroll]);

  // Listen for region changes elsewhere
  useEffect(() => {
    const handleRegionUpdate = () => setSelectedRegion(localStorage.getItem("region") || "Global");
    window.addEventListener("regionChange", handleRegionUpdate);
    return () => window.removeEventListener("regionChange", handleRegionUpdate);
  }, []);

  return (
    <nav className={`navbar ${isVisible ? "fade-in" : "fade-out"}`} ref={navbarRef}>
      <div
        className="navbar-logo"
        onClick={() => {
          navigate("/", { replace: true });
          setTimeout(() => window.location.reload(), 1); // Optional: remove if client-side routing handles data fine
        }}
      >
        <Link to="/">CineSpin</Link>
      </div>

      <div className="navbar-content">
        <span className="region-span">{selectedRegion}</span>

        <label className="popup">
          <input
            type="checkbox"
            checked={isPopupOpen}
            onChange={() => setIsPopupOpen(!isPopupOpen)}
          />
          <div tabIndex="0" className="burger"></div>
          <nav className="popup-window" ref={popupRef}>
            <ul>
              {["Global", "India"].map((region) => (
                <li key={region}>
                  <button onClick={() => handleRegionChange(region)}>
                    <span>{region}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </label>

        <label className="theme-switch">
          <input
            type="checkbox"
            className="theme-switch__checkbox"
            checked={isDarkMode}
            onChange={() => setIsDarkMode((prev) => !prev)}
          />
          <div className="theme-switch__container">
            {/* Sun/Moon theme UI preserved */}
            <div className="theme-switch__clouds"></div>
            <div className="theme-switch__stars-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M135.831 3.00688C135.055 3.85027 ... (truncated)"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div className="theme-switch__circle-container">
              <div className="theme-switch__sun-moon-container">
                <div className="theme-switch__moon">
                  <div className="theme-switch__spot"></div>
                  <div className="theme-switch__spot"></div>
                  <div className="theme-switch__spot"></div>
                </div>
              </div>
            </div>
          </div>
        </label>

        <div className="profile-container">
          <div className="profile-picture"></div>
          <div className="profile-data-container">
            <span id="profile-name">Anurag</span>
            <span id="profile-type">Premium</span>
          </div>
          <div
            className="profile-expander"
            role="button"
            tabIndex="0"
            aria-label="Expand profile settings"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
          >
            <FaChevronDown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;