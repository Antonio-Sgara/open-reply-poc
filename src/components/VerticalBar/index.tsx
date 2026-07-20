import React from "react";

const VerticalBar = ({ color = "#0f766e" }: { color?: string }) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: 2,
      display: "inline-block",
      height: 38,
      width: 5
    }}
  />
);

export default VerticalBar;
