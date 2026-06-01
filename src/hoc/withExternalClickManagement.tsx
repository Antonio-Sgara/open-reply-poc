import React from "react";

const withExternalClickManaged = (Component: any) => {
  return function WithExternalClickManaged(props: any) {
    return <Component {...props} />;
  };
};

export default withExternalClickManaged;
