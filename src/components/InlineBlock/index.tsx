import React from "react";

const InlineBlock = ({ children, className = "", style = {}, onClick }: any) => (
  <div
    className={className}
    style={{ display: "inline-block", ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

export default InlineBlock;
