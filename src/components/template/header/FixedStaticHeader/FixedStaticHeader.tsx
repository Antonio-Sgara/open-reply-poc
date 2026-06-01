import React from "react";
import "./FixedStaticHeader.scss";
import GruppoIccreaLogo from "assets/Gruppo_iccrea-logo.svg";
import BCCLogoWhite from "assets/BCC-logo-white.svg";
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
          <div className="c-iccrea-logo">
            <img src={GruppoIccreaLogo} alt="Gruppo ICCREA" />
          </div>

          <div className="c-bcc-logo">
            <img src={BCCLogoWhite} alt="BCC" />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
