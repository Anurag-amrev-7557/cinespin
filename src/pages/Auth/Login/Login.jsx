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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMsg('');
    // Placeholder - Implement Apple login with Firebase or third-party service
    setErrorMsg('Apple login is not yet implemented.');
  };

  const handleGithubSignIn = async () => {
    setErrorMsg('');
    try {
      const githubProvider = new GithubAuthProvider();
      await signInWithPopup(auth, githubProvider);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <div className="form-content">
          <h1 className="form-title">
            <span className="text-higlight">Login</span>{" "}
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
                />
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
                    />
                    <span 
                    className="password-toggle"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                    {passwordVisible ? <span><LuEye /></span> : <span><LuEyeOff /></span>}
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

              {errorMsg && <div className="error-message">{errorMsg}</div>}

              <div className="submit-container">
                <button
                  type="submit"
                  className="submit-button"
                >
                  Login
                </button>
                <div className="login-links">
                  <span><FaGoogle onClick={handleGoogleSignIn} /></span>
                  <span><SiApple onClick={handleAppleSignIn} /></span>
                  <span><FaGithub onClick={handleGithubSignIn} /></span>
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