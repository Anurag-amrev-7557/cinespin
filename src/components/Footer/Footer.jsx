import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; // Ensure styling is handled here

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDb API</a></p>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="footer-social">
          <a href="https://twitter.com/yourtwitter" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/yourlinkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
        <p className="footer-text">&copy; {new Date().getFullYear()} Movie Randomizer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;