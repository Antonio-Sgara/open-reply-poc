/* eslint-disable eqeqeq */
import React, { ReactNode } from "react";
import Loader from "../Loader/Loader";
import "./Button.scss";

interface IProps {
  name: string | React.ReactElement;
  type?: string;
  size?: string;
  primary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  disabled?: boolean;
  center?: boolean;
  fontIcon?: string;
  svgIcon?: ReactNode;
  onClick?: Function;
  className?: string;
  contentClassName?: string;
  styleContentWrapper?: object;
  styleButton?: object;
  styleFontIcon?: object;
  badge?: any;
  hide?: boolean;
  loading?: boolean;
  centeredText?: boolean;
  ref?: any;
}

export enum buttonSizes {
  LARGE = "large",
  REGULAR = "regular",
  REGULAR_ICON = "regular-icon",
  THIN = "thin",
  THIN_ICON = "thin-icon",
  ICON_MD = "icon-md",
  ICON_SM = "icon-sm",
  ICON_XS = "icon-xs"
}

export const Button: React.FC<IProps> = ({
  styleButton = {},
  styleContentWrapper = {},
  styleFontIcon = {},
  onClick = () => undefined,
  hide = false,
  className = "",
  centeredText = false,
  contentClassName = "",
  loading = false,
  ref,
  ...props
}) => {
  const colorType = props.primary
    ? "primary"
    : props.secondary
      ? "secondary"
      : props.tertiary
        ? "tertiary"
        : "secondary";

  const disabled = props.disabled ? "disabled" : "";
  return !hide ? (
    <div
      ref={ref}
      className={`button__container ${className} ${
        props.svgIcon ? "svgIconButton" : ""
      }`}
    >
      <button
        style={styleButton}
        type={"button"}
        className={`button__ ${contentClassName} ${props.size} ${colorType} ${disabled}`}
        onClick={e => onClick(e)}
        disabled={props.disabled}
      >
        <div
          style={styleContentWrapper}
          className={`button__contentWrapper ${props.size} ${disabled} ${
            props.center ? "center" : ""
          }`}
        >
          {props?.badge && (
            <div className={"button__badge"}>{props?.badge}</div>
          )}
          {props.name &&
            props.size != "icon-md" &&
            props.size != "icon-sm" &&
            props.size != "icon-xs" && (
              <div
                className={`button__label ${centeredText ? "mx-auto" : null}`}
              >
                {props.name}
              </div>
            )}
          {props.fontIcon && (
            <div
              style={styleFontIcon}
              className={`button__icon ${props.size} ${props.fontIcon}`}
            />
          )}
          {props.svgIcon && props.svgIcon}
          {loading && (
            <Loader.WidgetWrapper>
              <Loader.Spinner className={"button__loader"} />
            </Loader.WidgetWrapper>
          )}
        </div>
      </button>
    </div>
  ) : (
    <></>
  );
};

Button.defaultProps = {
  size: ""
};

export default Button;
