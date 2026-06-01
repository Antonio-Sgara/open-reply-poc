import * as React from "react";
import { FC } from "react";

import Header from "components/template/header/Header/Header";

interface IProps {
  children?: React.ReactNode;
}

export const PageTemplate: FC<IProps> = props => {
  return (
    <>
      <Header />
      <div>{props.children}</div>
    </>
  );
};
