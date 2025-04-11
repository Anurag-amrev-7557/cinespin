import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Profile.css";

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    photoURL: "",
    watchHistory: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserDetails({
        name: user.displayName || "User",
        email: user.email || "Not available",
        photoURL: user.photoURL || "/default-profile.jpg", // Add a default profile image
        watchHistory: user.watchHistory || [], // Assuming watch history is saved in the user's profile
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login"); // Navigate to login after logout
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  const bounceAnimation = {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 1,
      },
    },
    exit: { opacity: 0, y: -60 },
  };

  useEffect(() => {
    if (loading) return; // Wait for auth loading to complete
    if (!user) navigate("/"); // Redirect to home if not authenticated
  }, [loading, user, navigate]);

  return (
    <div className="login-container">
      {userDetails.name && (
        <Helmet>
          <title>{userDetails.name}'s Profile - Cinespin</title>
          <meta name="description" content={`View ${userDetails.name}'s profile, watch history, and account settings on Cinespin.`} />
        </Helmet>
      )}
      <div className="form-section">
        <motion.div className="form-content" {...bounceAnimation} style={{ margin: "10%"}}>
          <motion.h1 className="form-title" {...bounceAnimation}>
            <motion.span className="text-highlight" {...bounceAnimation}>Profile</motion.span>{" "}
            <motion.span className="text-muted" {...bounceAnimation}>Page</motion.span>
          </motion.h1>

          <motion.div
            className="profile-photo-wrapper"
            {...bounceAnimation}
          >
            <motion.div
              className="profile-image"
              style={{
                backgroundImage: `url(${userDetails.photoURL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "7vw",
                height: "7vw",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #ccc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
                transition: "border-color 0.3s ease",
              }}
              {...bounceAnimation}
            ></motion.div>
            <motion.div className="profile-info" {...bounceAnimation}>
              <motion.h1  {...bounceAnimation}>{userDetails.name}</motion.h1>
              <motion.p  {...bounceAnimation}>{userDetails.email}</motion.p>
              <motion.button className="logout-button" onClick={handleLogout}  {...bounceAnimation}>
                Logout
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div className="profile-content" {...bounceAnimation}>
            <motion.h2  {...bounceAnimation}>Watch History</motion.h2>
            <motion.div className="watch-history" {...bounceAnimation}>
              {userDetails.watchHistory.length === 0 ? (
                <motion.p  {...bounceAnimation}>No movies watched yet.</motion.p>
              ) : (
                <ul className="movie-list">
                  {userDetails.watchHistory.map((movie, index) => (
                    <li key={index} className="movie-item">
                      <div className="movie-poster-container">
                        <img
                          src={movie.posterURL}
                          alt={movie.title}
                          className="movie-poster"
                        />
                      </div>
                      <div className="movie-details">
                        <h3>{movie.title}</h3>
                        <p>{movie.year}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            <motion.div className="profile-settings" {...bounceAnimation}>
              <motion.h2  {...bounceAnimation}>Settings</motion.h2>
              <ul className="settings-list">
                <li>
                  <motion.button
                    className="settings-button"
                    onClick={() => navigate("/change-password")}
                    {...bounceAnimation}
                  >
                    Change Password
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    className="settings-button"
                    onClick={() => navigate("/update-profile")}
                    {...bounceAnimation}
                  >
                    Update Profile
                  </motion.button>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="pattern-section" {...bounceAnimation}>
        <motion.div className="pattern-svg" {...bounceAnimation}>
          <motion.svg
            viewBox="0 0 400 800"
            xmlns="http://www.w3.org/2000/svg"
            className="pattern"
            {...bounceAnimation}
          >
            <motion.defs {...bounceAnimation}>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <mask id="mask" x="0" y="0" width="100%" height="100%">
                <rect width="100%" height="100%" fill="white" />
                <circle cx="200" cy="400" r="250" fill="black" />
              </mask>
            </motion.defs>

            <g mask="url(#mask)">
              <motion.path
                d="M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z"
                fill="url(#gradient)"
                {...bounceAnimation}
              >
                <animate
                  attributeName="d"
                  dur="12s"
                  repeatCount="indefinite"
                  values="
                    M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z;
                    M0,800 C100,600 200,700 300,600 C400,700 500,600 600,700 C700,600 800,700 900,800 L900,0 L0,0 Z;
                    M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z
                  "
                />
              </motion.path>
              <circle cx="200" cy="400" r="250" fill="white" opacity="0.5">
                <animate
                  attributeName="r"
                  dur="8s"
                  values="250;200;250"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;