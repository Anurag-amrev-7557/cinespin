import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./PasswordChange.css";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { LuEye, LuEyeOff } from "react-icons/lu";

const PasswordChange = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

const bounceIn = {
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

// Inside the PasswordChange component
const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
  
    // Basic password validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All fields are required.");
      setIsLoading(false);
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      setIsLoading(false);
      return;
    }
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      // Re-authenticate user with their old password
      const credentials = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credentials);
  
      // Once re-authenticated, update the password
      await updatePassword(user, newPassword);
  
      navigate('/profile'); // Navigate to the profile page after successful password change
    } catch (err) {
      console.log("Error: ", err); // Debugging log to inspect the error object
      setErrorMsg("An error occurred while changing the password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <>
      <Helmet>
        <title>Change Password - Cinespin</title>
        <meta name="description" content="Secure your Cinespin account by updating your password. Enter your current and new password to continue." />
      </Helmet>
      <div className="login-container">
        <div className="form-section">
          <motion.div className="form-content" {...bounceAnimation}>
            <motion.h1 className="form-title"  {...bounceAnimation}>
              <span className="text-highlight">Change</span>{" "}
              <span className="text-muted">Password</span>
            </motion.h1>

            <motion.div className="form-subtitle"  {...bounceAnimation}>
              <p>Update your password</p>
            </motion.div>

            <motion.form onSubmit={handleSubmit} autoComplete="on" noValidate  {...bounceAnimation}>
              <motion.div className="form-group"  {...bounceAnimation}>
                <motion.div className="form-control"  {...bounceAnimation}>
                  <label htmlFor="old-password">Old Password</label>
                  <div className="password-container">
                    <input
                      id="old-password"
                      type={passwordVisible ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      aria-invalid={errorMsg ? "true" : "false"}
                    />
                    <span 
                      className="password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                      {passwordVisible ? <LuEye /> : <LuEyeOff />}
                    </span>
                  </div>
                </motion.div>

                <motion.div className="form-control"  {...bounceAnimation}>
                  <label htmlFor="new-password">New Password</label>
                  <div className="password-container">
                    <input
                      id="new-password"
                      type={passwordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      aria-invalid={errorMsg ? "true" : "false"}
                    />
                    <span 
                      className="password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                      {passwordVisible ? <LuEye /> : <LuEyeOff />}
                    </span>
                  </div>
                </motion.div>

                <motion.div className="form-control"  {...bounceAnimation}>
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <div className="password-container">
                    <input
                      id="confirm-password"
                      type={passwordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      aria-invalid={errorMsg ? "true" : "false"}
                    />
                    <span 
                      className="password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                      {passwordVisible ? <LuEye /> : <LuEyeOff />}
                    </span>
                  </div>
                </motion.div>

                {errorMsg && <div className="error-message" role="alert">{errorMsg}</div>}

                <motion.div className="submit-container"  {...bounceAnimation}>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Changing password..." : "Change Password"}
                  </button>
                  <div className="form-links">
                    <Link to="/profile">Back to Profile</Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
        <div className="pattern-section">
          <div className="pattern-svg">
            <svg
              viewBox="0 0 400 800"
              xmlns="http://www.w3.org/2000/svg"
              className="pattern"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <mask id="mask" x="0" y="0" width="100%" height="100%">
                  <rect width="100%" height="100%" fill="white" />
                  <circle cx="200" cy="400" r="250" fill="black" />
                </mask>
              </defs>

              <g mask="url(#mask)">
                <path
                  d="M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z"
                  fill="url(#gradient)"
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
                </path>
                <circle cx="200" cy="400" r="250" fill="white" opacity="0.5">
                  <animate
                    attributeName="r"
                    dur="8s"
                    values="250;200;250"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordChange;