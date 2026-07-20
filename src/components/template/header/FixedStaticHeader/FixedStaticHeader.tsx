import React from "react";
import "./FixedStaticHeader.scss";
import SemanticSearchLogoWhite from "assets/semantic-search-logo-white.svg";
import { isMobile, isTablet } from "react-device-detect";

export const FixedStaticHeader = ({ children }) => {
  return (
    <div
      className={`pageContainer ${
        isTablet ? "tablet" : isMobile ? "mobile" : "desktop"
      }`}
    >
        <div className="c-note-head clearfix">
        <div className="l-container-fluid">
          <div className="c-semantic-search-logo">
            <img src={SemanticSearchLogoWhite} alt="Semantic Search POC" />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
