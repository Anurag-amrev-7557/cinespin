import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Login.css";
import { FaGoogle, FaGithub } from "react-icons/fa";
import {motion, AnimatePresence} from "framer-motion";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { SiApple } from "react-icons/si";
import { signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../../firebase';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    // Basic email and password validation
    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      setIsLoading(false);
      return;
    }
  
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.log("Firebase error: ", err); // Debugging log to inspect the error object
      // Handle specific Firebase Auth error codes
      switch (err.code) {
        case "auth/wrong-password":
          setErrorMsg("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setErrorMsg("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setErrorMsg("The email address is not valid.");
          break;
        case "auth/network-request-failed":
          setErrorMsg("Network error. Please check your connection and try again.");
          break;
        case "auth/too-many-requests":
          setErrorMsg("Too many attempts. Please try again later.");
          break;
        default:
          setErrorMsg("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setErrorMsg("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    // Placeholder - Implement Apple login with Firebase or third-party service
    setErrorMsg('Apple login is not yet implemented.');
    setIsLoading(false);
  };

  const handleGithubSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const githubProvider = new GithubAuthProvider();
      await signInWithPopup(auth, githubProvider);
      navigate('/');
    } catch (err) {
      setErrorMsg("GitHub sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        <title>Login to Cinespin</title>
        <meta name="description" content="Access your Cinespin account to explore movies, shows, and personalized content. Login now to continue watching." />
      </Helmet>
      <div className="login-container">
        <div className="form-section">
          <motion.div className="form-content" {...bounceAnimation}>
            <motion.h1 className="form-title" {...bounceAnimation}>
              <motion.span className="text-highlight" {...bounceAnimation}>Login</motion.span>{" "}
              <motion.span className="text-muted" {...bounceAnimation}>Form</motion.span>
            </motion.h1>

            <motion.div className="form-subtitle" {...bounceAnimation}>
              <motion.p {...bounceAnimation}>Welcome back,</motion.p>
              <motion.p {...bounceAnimation}>Please sign in to your account</motion.p>
            </motion.div>

            <motion.form onSubmit={handleSubmit} autoComplete="on" noValidate  {...bounceAnimation}>
              <div className="form-group">
                <motion.div className="form-control" {...bounceAnimation}>
                  <motion.label htmlFor="email" {...bounceAnimation}>Email</motion.label>
                  <motion.input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    aria-describedby="emailHelp"
                    aria-invalid={errorMsg ? "true" : "false"}
                    {...bounceAnimation}
                  />
                  {errorMsg && !isValidEmail(email) && <small id="emailHelp" className="error-text">Please enter a valid email address.</small>}
                </motion.div>

                <motion.div className="form-control" {...bounceAnimation}>
                  <motion.label htmlFor="password" {...bounceAnimation}>Password</motion.label>
                  <motion.div className="password-container">
                    <motion.input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-invalid={errorMsg ? "true" : "false"}
                      {...bounceAnimation}
                    />
                    <span 
                      className="password-toggle"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                      {...bounceAnimation}
                    >
                      {passwordVisible ? <LuEye /> : <LuEyeOff />}
                    </span>
                  </motion.div>
                </motion.div>

                <motion.div className="checkbox-group" {...bounceAnimation}>
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </motion.div>

                {errorMsg && <div className="error-message" role="alert">{errorMsg}</div>}

                <motion.div className="submit-container" {...bounceAnimation}>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                  <div className="login-links">
                    <span onClick={handleGoogleSignIn}><FaGoogle aria-label="Login with Google" /></span>
                    <span onClick={handleAppleSignIn}><SiApple aria-label="Login with Apple" /></span>
                    <span onClick={handleGithubSignIn}><FaGithub aria-label="Login with GitHub" /></span>
                  </div>
                </motion.div>

                <motion.div className="form-links" {...bounceAnimation}>
                  <Link to="/register">Register</Link>
                  <Link to="/forgot-password">Forgot Your Password?</Link>
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

export default Login;