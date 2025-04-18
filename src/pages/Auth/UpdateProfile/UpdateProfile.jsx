import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./UpdateProfile.css";

const UpdateProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const storage = getStorage();

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

  const handlePhotoChange = async (file) => {
    setError("");
  
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be under 5MB.");
      return;
    }
  
    const fileRef = ref(storage, `avatars/${user.uid}/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setPhotoURL(url); // now this is a Firebase-hosted URL, not base64
    } catch (err) {
      setError("Failed to upload image.");
      console.error("Upload error:", err);
    }
  };

  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkmxpffpk",
        uploadPreset: "unsigned_avatars",
        integration: "popup",
        sources: ["local", "camera"],
        cropping: true,
        folder: "avatars",
        multiple: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        styles: {
          palette: {
            window: "#2A303F",
            sourceBg: "#151B29",
            windowBorder: "#8E8E8E",
            tabIcon: "#FFFFFF",
            inactiveTabIcon: "#D3D3D3",
            menuIcons: "#FFF",
            link: "#374151",
            action: "#FF5722",
            inProgress: "#FF9800",
            complete: "#4CAF50",
            error: "#F44336",
            textDark: "#000000",
            textLight: "#FFFFFF"
          },
          fonts: {
            default: null,
            "'Biotif', sans-serif": {
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (!error && result.event === "success") {
          setPhotoURL(result.info.secure_url); 
        }
      }
    );
  };

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
      <title>Update Profile - Cinespin</title>
      <meta name="description" content="Update your Cinespin profile information including display name and profile picture for a personalized experience." />
    </Helmet>
    <div className="login-container">
      <div className="form-section">
        <motion.div className="form-content" {...bounceAnimation}>
          <motion.h1 className="form-title" {...bounceAnimation}>
            <motion.span className="text-highlight" {...bounceAnimation}>Update</motion.span>{" "}
            <motion.span className="text-muted" {...bounceAnimation}>Profile</motion.span>
          </motion.h1>

          <motion.div className="form-subtitle" {...bounceAnimation}>
            <motion.p {...bounceAnimation}>Modify your profile details</motion.p>
          </motion.div>

          <motion.div
            className="profile-photo-wrapper"
            {...bounceAnimation}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "2rem",
              position: "relative",
            }}
          >
            <motion.div
              onClick={openCloudinaryWidget}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handlePhotoChange(file);
              }}
              style={{
                width: "8rem",
                height: "8rem",
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
              className="profile-photo-drop"
              {...bounceAnimation}
            >
                <motion.img
                  src={photoURL || "/download.svg"}
                  alt="Profile Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/download.svg";
                  }}
                  {...bounceAnimation}
                />
              <input
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handlePhotoChange(file);
                }}
                style={{ display: "none" }}
              />
            </motion.div>
          </motion.div>

          <motion.form onSubmit={handleSubmit} autoComplete="on" noValidate {...bounceAnimation}>
            <div className="form-group">
              <motion.div className="form-control" {...bounceAnimation}>
                <motion.label htmlFor="displayName" {...bounceAnimation}>Display Name</motion.label>
                <motion.input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  {...bounceAnimation}
                />
              </motion.div>

              {error && <div className="error-message" role="alert">{error}</div>}
              {message && <div className="success-message" role="status">{message}</div>}

              <motion.div className="submit-container" {...bounceAnimation}>
                <button type="submit" className="submit-button">
                  Update Profile
                </button>
                <div className="form-links">
                  <Link to="/profile">Back to Profile</Link>
                </div>
              </motion.div>
            </div>
          </motion.form>
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
    </>
  );
};

export default UpdateProfile;