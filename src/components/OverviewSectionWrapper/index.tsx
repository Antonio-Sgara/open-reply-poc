import React from "react";
import HeaderSvg from "assets/illustrazione/header-path.svg";

const OverviewSectionWrapper = ({ className = "", children = null }: any) => {
  return (
    <div
      className={"overviewSection__wrapper " + className}
      style={{
        backgroundImage:
          'url("' + HeaderSvg + '"), linear-gradient(109deg, #264d7a, #3582b2)'
      }}
    >
      {children}
    </div>
  );
};

export default OverviewSectionWrapper;
