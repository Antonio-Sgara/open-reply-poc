import React from "react";

const InputWithIncrement = ({
  value,
  onValueChange,
  onAdd,
  onSubtract,
  disabled,
  className = "",
  placeholder,
  onFocus,
  onBlur
}: any) => {
  return (
    <div className={className} style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <button type="button" onClick={onSubtract} disabled={disabled}>
        -
      </button>
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={e =>
          onValueChange?.({
            floatValue: e.target.value === "" ? 0 : Number(e.target.value)
          })
        }
      />
      <button type="button" onClick={onAdd} disabled={disabled}>
        +
      </button>
    </div>
  );
};

export default InputWithIncrement;
