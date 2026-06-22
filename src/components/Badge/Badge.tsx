import React from "react";
import "./Badge.scss";

interface IProps {
  name: any;
  id?: string;
  color?: string;
  icon?: string;
  wide?: boolean;
  narrow?: boolean;
  circle?: boolean;
  thick?: boolean;
  thin?: boolean;
  onClick?: Function;
  onDelete?: Function;
  labelStyle?: any;
  iconStyle?: any;
  className?: string;
  containerClassName?: string;
}

export const Badge: React.FC<IProps> = ({
  labelStyle = {},
  iconStyle = {},
  className = "",
  containerClassName = "",
  ...props
}) => {
  const badgeWidth = props.wide
    ? "wide"
    : props.narrow
      ? "narrow"
      : props.circle
        ? "circle"
        : "";
  const badgeHeight = props.thick
    ? "thick"
    : props.thin
      ? "thin"
      : props.circle
        ? "circle"
        : "";
  const deletable =
    props.onDelete && typeof props.onDelete === "function" ? "deletable" : "";

  return (
    <div className={`badge__container ${containerClassName}`}>
      <div
        className={`badge ${props.color} ${className} ${badgeWidth} ${badgeHeight} ${deletable}`}
        onClick={e => {
          if (props.onClick && typeof props.onClick === "function") {
            props.onClick(e, props.name, props.id);
          }
        }}
      >
        <div className="badge__content">
          {props.icon && (
            <span style={iconStyle} className={`badge__icon ${props.icon}`} />
          )}
          <span style={labelStyle} className="badge__label text-uppercase">
            {props.name}
          </span>
        </div>
        {deletable ? (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              props.onDelete?.(e, props.name, props.id);
            }}
            className="badge__DeleteBtn icon-close-small"
          />
        ) : null}
      </div>
    </div>
  );
};
