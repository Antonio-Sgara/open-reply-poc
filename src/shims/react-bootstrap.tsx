import React from "react";

export const Container = ({ children }: any) => <div>{children}</div>;
export const Row = ({ children }: any) => <div>{children}</div>;
export const Col = ({ children }: any) => <div>{children}</div>;
export const Collapse = ({ in: isOpen, children }: any) =>
  isOpen ? <>{children}</> : null;
