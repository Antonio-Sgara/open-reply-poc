import React from "react";
import "./Title.scss";

interface IProps {
  name: string | React.ReactNode;
  className?: string;
  titleClassName?: string;
  clickable?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Title: any = (_props: any) => {
  return <div />;
};

const Page: React.FC<IProps> = props => {
  return (
    <div className={`TitlePage ${props.className ? props.className : ""}`}>
      <h1 className={`TitlePage__title`}> {props.name}</h1>
    </div>
  );
};

const Tab: React.FC<IProps> = props => {
  return (
    <div className={`TitleTab ${props.className ? props.className : ""}`}>
      <h2 className={`TitleTab__title`}> {props.name}</h2>
    </div>
  );
};

const Module: React.FC<IProps> = props => {
  return (
    <div className={`TitleModule ${props.className ? props.className : ""}`}>
      <h1 className={`TitleModule__title`}> {props.name}</h1>
      {props.children}
    </div>
  );
};

const Widget: React.FC<IProps> = props => {
  return (
    <div className={`TitleWidget ${props.className ? props.className : ""}`}>
      <h1
        className={`TitleWidget__title ${props.clickable ? "clickable" : ""}`}
        onClick={props.clickable ? props.onClick : () => null}
      >
        {props.name || props.children}
      </h1>
    </div>
  );
};

const FullPage: React.FC<IProps> = props => {
  return (
    <div className={`TitleFullPage ${props.className ? props.className : ""}`}>
      <h1
        className={`TitleFullPage__title ${
          props.titleClassName ? props.titleClassName : ""
        }`}
      >
        {props.name || props.children}
      </h1>
    </div>
  );
};

Title.Tab = Tab;
Title.Module = Module;
Title.Page = Page;
Title.Widget = Widget;
Title.FullPage = FullPage;

export default Title;
