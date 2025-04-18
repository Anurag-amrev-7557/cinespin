import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
        <div className="upper-footer">
          <div className="upper-heading">
            Request or recommend a movie here
          </div>
          <div className="upper-form">
            <form className="footer-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" placeholder="Enter your first name" required />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" placeholder="Enter your last name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required />
              </div>
              <button type="submit" className="submit-btn">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="lower-footer">
          <div className="lower-div">
            <div className="footer-heading">Explore</div>
            <ul>
              <li className="footer-item">Movies</li>
              <li className="footer-item">Series</li>
              <li className="footer-item">Sports</li>
              <li className="footer-item">Random Watch</li>
              <li className="footer-item">Trending Now</li>
            </ul>
          </div>
          <div className="lower-div">
            <div className="footer-heading">Support</div>
            <ul>
              <li className="footer-item">Help Center</li>
              <li className="footer-item">FAQ</li>
              <li className="footer-item">Contact Us</li>
              <li className="footer-item">Report an Issue</li>
              <li className="footer-item">How It Works</li>
            </ul>
          </div>
          <div className="lower-div">
            <div className="footer-heading">Legal</div>
            <ul>
              <li className="footer-item">Terms of Service</li>
              <li className="footer-item">Privacy Policy</li>
              <li className="footer-item">Cookie Policy</li>
              <li className="footer-item">Content Guidelines</li>
            </ul>
          </div>
          <div className="lower-div">
            <div className="footer-heading">Connect</div>
            <ul>
              <li className="footer-item">Blog</li>
              <li className="footer-item">About Us</li>
              <li className="footer-item">Careers</li>
              <li className="footer-item">Press</li>
            </ul>
          </div>
          <div className="lower-div">
            <div className="footer-heading">Follow Us</div>
            <ul>
              <li className="footer-item">Facebook</li>
              <li className="footer-item">X</li>
              <li className="footer-item">Instagram</li>
              <li className="footer-item">YouTube</li>
              <li className="footer-item">Discord</li>
            </ul>
          </div>
        </div>
    </footer>
  );
};

export default Footer;