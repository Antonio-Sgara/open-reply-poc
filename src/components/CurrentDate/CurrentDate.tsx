import React from "react";
import Sun from "assets/illustrazione/functional/sun.svg";
import "./CurrentDate.scss";

interface IProps {
  date: string | React.ReactElement;
  meteo: string;
  className?: string;
  hideMeteo?: boolean;
}

export const CurrentDate: React.FC<IProps> = props => {
  return (
    <div className={`currentDate ${props.className ? props.className : ""}`}>
      {!props.hideMeteo && (
        <span className="currentDate__icon">{getMeteoIcon(props.meteo)}</span>
      )}
      <span className="currentDate__date">{props.date}</span>
    </div>
  );
};

const getMeteoIcon = (val: string) => {
  switch (val) {
    case "SUN":
      return <img src={Sun} alt="" />;
    default:
      return <img src={Sun} alt="" />;
  }
};
