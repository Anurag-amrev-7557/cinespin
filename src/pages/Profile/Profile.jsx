import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div
          className="profile-image"
          style={{
            backgroundImage: `url(${userDetails.photoURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "50%", // Circular profile image
          }}
        ></div>
        <div className="profile-info">
          <h1>{userDetails.name}</h1>
          <p>{userDetails.email}</p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="profile-content">
        <h2>Watch History</h2>
        <div className="watch-history">
          {userDetails.watchHistory.length === 0 ? (
            <p>No movies watched yet.</p>
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
        </div>

        <div className="profile-settings">
          <h2>Settings</h2>
          <ul className="settings-list">
            <li>
              <button
                className="settings-button"
                onClick={() => navigate("/change-password")}
              >
                Change Password
              </button>
            </li>
            <li>
              <button
                className="settings-button"
                onClick={() => navigate("/update-profile")}
              >
                Update Profile
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;