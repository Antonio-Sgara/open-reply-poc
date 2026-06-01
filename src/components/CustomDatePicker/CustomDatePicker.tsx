import React from "react";

const CustomDatePicker = ({ value, onSelect, disabled, placeholder }: any) => (
  <input
    value={value ?? ""}
    placeholder={placeholder}
    disabled={disabled}
    onChange={event => onSelect?.(event.target.value)}
  />
);

export default CustomDatePicker;
