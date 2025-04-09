import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { FaGoogle, FaGithub } from "react-icons/fa";
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

  return (
    <div className="login-container">
      <div className="form-section">
        <div className="form-content">
          <h1 className="form-title">
            <span className="text-highlight">Login</span>{" "}
            <span className="text-muted">Form</span>
          </h1>

          <div className="form-subtitle">
            <p>Welcome back,</p>
            <p>Please sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="on" noValidate>
            <div className="form-group">
              <div className="form-control">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  aria-describedby="emailHelp"
                  aria-invalid={errorMsg ? "true" : "false"}
                />
                {errorMsg && !isValidEmail(email) && <small id="emailHelp" className="error-text">Please enter a valid email address.</small>}
              </div>

              <div className="form-control">
                <label htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="checkbox-group">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              {errorMsg && <div className="error-message" role="alert">{errorMsg}</div>}

              <div className="submit-container">
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
              </div>

              <div className="form-links">
                <Link to="/register">Register</Link>
                <Link to="/forgot-password">Forgot Your Password?</Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="pattern-section">
        <div className="pattern-svg">
          <svg
            viewBox="0 0 400 800"
            xmlns="http://www.w3.org/2000/svg"
            className="pattern"
          >
            <path
              d="M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z"
              fill="url(#gradient)"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                  M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z;
                  M0,800 C100,600 200,700 300,600 C400,700 500,600 600,700 C700,600 800,700 900,800 L900,0 L0,0 Z;
                  M0,800 C100,700 200,600 300,700 C400,800 500,700 600,600 C700,500 800,600 900,700 L900,0 L0,0 Z
                "
              />
            </path>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;