import React, { useEffect } from "react";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <div className="cloak__wrapper">
        <div className="cloak__container">
          <div className="cloak"></div>
        </div>
      </div>
      <div className="info">
        <h2>We canˈt find that page</h2>
        <p>
          Weˈre fairly sure that page used to be here, but seems to have gone
          missing. We do apologize on its behalf.
        </p>
        <a
          href="https://jhey.dev"
          target="_blank"
          rel="noreferrer noopener"
        >
          Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;