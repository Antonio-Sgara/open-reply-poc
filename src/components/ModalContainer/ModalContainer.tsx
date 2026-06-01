import React from "react";

export enum ModalSize {
  SIDEBAR = "SIDEBAR"
}

const ModalContainer = ({ show, children }: any) => {
  if (!show) return null;
  return <div>{children}</div>;
};

export default ModalContainer;
