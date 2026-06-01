import React from "react";

const InfoAlert = ({ showInfo, children }: any) => {
  if (!showInfo) return null;
  return <div>{children}</div>;
};

export default InfoAlert;
