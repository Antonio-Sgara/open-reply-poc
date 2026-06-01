import React from "react";

const CustomInput = ({ value, onChange, placeholder, disabled, type }: any) => (
  <input
    type={type ?? "text"}
    value={value ?? ""}
    placeholder={placeholder}
    disabled={disabled}
    onChange={onChange}
  />
);

export default CustomInput;
