import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import "./UpdateProfile.css";

const UpdateProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await updateUserProfile({ displayName, photoURL });
      setMessage("Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to update profile.");
    }
  };

  const bounceAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div className="update-profile-page" {...bounceAnimation}>
      <motion.h2 {...bounceAnimation}>Update Profile</motion.h2>
      <motion.form className="update-profile-form" onSubmit={handleSubmit} {...bounceAnimation}>
        <motion.label {...bounceAnimation}>
          Display Name:
          <motion.input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            {...bounceAnimation}
          />
        </motion.label>
        <motion.label {...bounceAnimation}>
          Profile Photo URL:
          <motion.input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            {...bounceAnimation}
          />
        </motion.label>
        {error && <motion.div className="error-text" {...bounceAnimation}>{error}</motion.div>}
        {message && <motion.div className="success-text" {...bounceAnimation}>{message}</motion.div>}
        <motion.button type="submit" className="update-button" {...bounceAnimation}>
          Update Profile
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default UpdateProfile;