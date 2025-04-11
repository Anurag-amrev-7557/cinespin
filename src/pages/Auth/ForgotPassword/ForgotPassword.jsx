import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Helmet } from "react-helmet-async";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Basic email validation
    if (!email) {
      setErrorMsg("Email is required.");
      setIsLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      navigate("/login"); // Navigate to the login page after sending the reset email
    } catch (err) {
      console.log("Error: ", err); // Debugging log to inspect the error object
      setErrorMsg("An error occurred while sending the password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Helmet>
      <title>Reset Your Password - Cinespin</title>
      <meta name="description" content="Enter your email to receive a password reset link and regain access to your Cinespin account." />
    </Helmet>
    <div className="login-container">
      <div className="form-section">
        <div className="form-content">
          <h1 className="form-title">
            <span className="text-highlight">Forgot</span>{" "}
            <span className="text-muted">Password</span>
          </h1>

          <div className="form-subtitle">
            <p>Enter your email to reset your password.</p>
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
                  aria-invalid={errorMsg ? "true" : "false"}
                />
              </div>

              {errorMsg && <div className="error-message" role="alert">{errorMsg}</div>}

              <div className="submit-container">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </button>
                <div className="form-links">
                  <Link to="/login">Back to Login</Link>
                </div>
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

export default ForgotPassword;