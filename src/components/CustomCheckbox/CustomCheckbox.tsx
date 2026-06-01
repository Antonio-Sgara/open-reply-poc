/* eslint-disable eqeqeq */
import React from "react";
import WithLoader from "../WithLoader/WithLoader";
import "./CustomCheckbox.scss";

export enum InputCheckType {
  Radio = "radio",
  Checkbox = "checkbox"
}

interface IProps {
  type?: InputCheckType;
  checked?: boolean;
  className?: string;
  id?: string;
  disabled?: boolean;
  label?: string | React.ReactNode;
  name?: string;
  onChange?: any;
  value?: any;
  labelStyle?: object;
  text?: React.ReactNode;
  classNameText?: string;
  children?: React.ReactNode;
  showError?: boolean;
  loading?: boolean;
  checkedAnagraphicAnswer?: boolean;
}

const CheckedIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g>
      <path d="M5.787 16C5.292 16 4.819 15.778 4.495 15.391L0.41 10.504C-0.202 9.772 -0.119 8.67 0.595 8.043C1.308 7.415 2.382 7.5 2.995 8.232L5.665 11.427L14.106 0.99C15.412 -0.886 16.78 0.153 15.467 2.038L7.172 15.269C6.868 15.706 6.385 15.975 5.862 15.998C5.837 15.999 5.812 16 5.787 16Z" />
    </g>
  </svg>
);

const CustomCheckbox: React.FC<IProps> = ({
  type = InputCheckType.Radio,
  id,
  onChange = () => undefined,
  value,
  checked,
  name,
  disabled,
  className = "",
  labelStyle = {},
  classNameText = "",
  showError,
  loading,
  children,
  checkedAnagraphicAnswer
}) => {
  const handleContentClick = (fieldName?: string) => {
    const nextValue = { target: { name: fieldName } };
    onChange(nextValue);
  };

  const inputCheckTypeClassName = `${className} ${
    type == InputCheckType.Checkbox ? "withSvgCheck" : ""
  }`.trim();

  return (
    <React.Fragment>
      <WithLoader
        loading={loading}
        spinnerSize={"small"}
        className={"CustomCheckBox__loader"}
      >
        <div className={`CustomCheckbox ${inputCheckTypeClassName}`.trim()}>
          <div className="CustomCheckbox__wrapper">
            <label
              style={labelStyle}
              className={"CustomCheckbox__labelWrapper"}
            >
              <input
                id={id}
                className={`CustomCheckbox__input ${inputCheckTypeClassName}`.trim()}
                type={type == InputCheckType.Checkbox ? "checkbox" : "radio"}
                onClick={onChange}
                onChange={onChange}
                value={value}
                checked={checked}
                name={name}
                disabled={disabled}
              />
              {type == InputCheckType.Checkbox && (
                <CheckedIcon
                  className={`CustomCheckbox__checkIcon ${
                    disabled ? "disabled" : ""
                  } ${
                    checkedAnagraphicAnswer ? "Checked_AnagraphicAnswer" : ""
                  }`}
                />
              )}
              <span
                className={`CustomCheckbox__view ${inputCheckTypeClassName} ${
                  disabled ? "disabled" : ""
                } ${
                  type !== InputCheckType.Checkbox
                    ? checkedAnagraphicAnswer
                      ? "Checked_AnagraphicAnswer"
                      : ""
                    : ""
                }`.trim()}
                style={showError ? { border: "1px solid red" } : {}}
              />
            </label>
            <div
              className={`CustomCheckbox__text ${
                disabled
                  ? "CustomCheckbox__text__disabled " + classNameText
                  : classNameText
              }`.trim()}
              onClick={!disabled ? () => handleContentClick(name) : () => null}
            >
              {children}
            </div>
          </div>
        </div>
      </WithLoader>
    </React.Fragment>
  );
};

export default CustomCheckbox;
