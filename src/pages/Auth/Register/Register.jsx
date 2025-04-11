import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { SiApple } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../../../../firebase';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Client-side validation for email
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Password strength validation
  const isPasswordStrong = (password) => password.length >= 8; // Add more complexity rules if needed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!isEmailValid(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    if (!isPasswordStrong(password)) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Creating user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user);
      
      await updateProfile(userCredential.user, {
        displayName: username,
      });
      console.log("Profile updated!");
      
      navigate('/');
    } catch (err) {
      console.error("Error during registration:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMsg('');
    // Placeholder - Implement Apple login with Firebase or third-party service
    setErrorMsg('Apple login is not yet implemented.');
  };

  const handleGithubSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    const githubProvider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, githubProvider);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
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
    <div className="register-container">
      <div className="form-section">
        <motion.div className="form-content" {...bounceAnimation}>
          <motion.h1 className="form-title" {...bounceAnimation}>
            <span className="text-higlight">Signup</span>{" "}
            <span className="text-muted">Form</span>
          </motion.h1>

          <motion.div className="form-subtitle" {...bounceAnimation}>
            <p>Welcome,</p>
            <p>Please sign up to your account</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} autoComplete="on" noValidate {...bounceAnimation}>
            <motion.div className="form-group" {...bounceAnimation}>
              <motion.div className="form-control" {...bounceAnimation}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  aria-describedby="username-helper"
                />
                <small id="username-helper" className="form-text text-muted">
                  Choose a unique username.
                </small>
              </motion.div>

              <motion.div className="form-control" {...bounceAnimation}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby="email-helper"
                />
                <small id="email-helper" className="form-text text-muted">
                  Enter your email address.
                </small>
              </motion.div>

              <motion.div className="form-control" {...bounceAnimation}>
                <label htmlFor="password">Password</label>
                <div className="password-container">
                    <input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-describedby="password-helper"
                    />
                    <span 
                      className="password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      role="button" 
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                    >
                      {passwordVisible ? <LuEye /> : <LuEyeOff />}
                    </span>
                </div>
                <small id="password-helper" className="form-text text-muted">
                  Password must be at least 8 characters.
                </small>
              </motion.div>

              {errorMsg && <div className="error-message">{errorMsg}</div>}

              <motion.div className="submit-container" {...bounceAnimation}>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
                <div className="login-links">
                  <span><FaGoogle onClick={handleGoogleSignIn} role="button" aria-label="Sign in with Google" /></span>
                  <span><SiApple onClick={handleAppleSignIn} role="button" aria-label="Sign in with Apple" /></span>
                  <span><FaGithub onClick={handleGithubSignIn} role="button" aria-label="Sign in with GitHub" /></span>
                </div>
              </motion.div>

              <div className="form-links">
                <Link to="/login">Already have an account? Login here</Link>
              </div>
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
  );
};

export default Register;