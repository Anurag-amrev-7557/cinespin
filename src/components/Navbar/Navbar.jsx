import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import { getFromCache, setToCache } from "../../utils/cache"; // adjust path if needed
import { FaChevronDown } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
  const searchBarRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [activeItem, setActiveItem] = useState("Movies");
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("region") || "Global");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("darkMode") === "true" || localStorage.getItem("darkMode") === null
  );
  const { user, logout, auth, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchInput, setSearchInput] = useState("");

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
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setShowSearchBar(false);
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

  const profileImage = user?.photoURL || auth?.currentUser?.photoURL;

  return (
    <nav className={`navbar ${isVisible ? "fade-in" : "fade-out"}`} ref={navbarRef}>

      <div className="menu-button">
        <button className="menu-icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </div>
      <div className="gap"></div>
      <div
        className="navbar-logo"
        onClick={() => {
          navigate("/", { replace: true });
        }}
      >
        <Link to="/"><img src="/logo.webp"></img>CineSpin</Link>
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

        <div
          className={`profile-container ${user ? "logged-in" : "logged-out"}`}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          {loading ? null : user ? (
            <>
              <div
                className="profile-picture"
                style={{
                  backgroundImage: profileImage ? `url(${profileImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: "1"
                }}
              ></div>
              <div className="profile-data-container">
                <span id="profile-name">{user.displayName || "User"}</span>
                <span id="profile-type">Premium</span>
              </div>
              <motion.div
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "inline-block" }}
              >
                <FaChevronDown />
              </motion.div>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{ zIndex: 9999, position: "absolute" }}
                  >
                    <ul>
                      <li onClick={() => navigate("/profile")}><FaUser /> Profile</li>
                      <li onClick={logout}><PiSignOutFill />Logout</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.button
              className="signin-button"
              onClick={() => navigate("/login")}
              whileTap={{ scale: 0.65, transition: { duration: 0.1 } }}
            >
            <span>Sign In</span>
              <svg width="15px" height="10px" viewBox="0 0 13 10">
                <path d="M1,5 L11,5"></path>
                <polyline points="8 1 12 5 8 9"></polyline>
              </svg>
            </motion.button>
          )}
        </div>
        <div className="mobile-icons">
          <button className="search-icon-button" onClick={() => setShowSearchBar(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-icon lucide-search" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <button className="hamburger-icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.5 15h15v-1.5h-15V15Zm0-4.25h15v-1.5h-15v1.5Zm0-4.25h15V5h-15v1.5Z" />
            </svg>
          </button>
        </div>
      </div>
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              className="navbar-searchbar"
              ref={searchBarRef}
              initial={{ opacity: 0, y: -20, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -20, scaleY: 0.95, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ position: "absolute", top: 56, left: 0, right: 0, zIndex: 1000, transformOrigin: "top" }}
            >
            {searchInput ? (
              <span onClick={() => setSearchInput("")} className="clear-search-button" aria-label="Clear search">
                Clear
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-icon lucide-search" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            )}
            <input
              type="text"
              placeholder="Search"
              className="navbar-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;