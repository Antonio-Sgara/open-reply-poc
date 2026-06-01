import React from "react";

export const withHandleHeaderPosition = (Component: any) => {
  return function WithHandleHeaderPosition(props: any) {
    return <Component {...props} headerClass={props?.headerClass ?? "Header--relative"} />;
  };
};
