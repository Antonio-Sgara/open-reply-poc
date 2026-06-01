import React from "react";

export const Switch = ({ isOn, handleToggle }: any) => (
  <button type="button" onClick={() => handleToggle?.(!isOn)}>
    {isOn ? "ON" : "OFF"}
  </button>
);
