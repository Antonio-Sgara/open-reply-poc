import React from "react";

const WidgetWrapper = ({ children }: any) => <>{children}</>;
const Wrapper = ({ children }: any) => <>{children}</>;
const FixedWrapper = ({ children }: any) => <>{children}</>;
const Spinner = (_props: any) => null;

const Loader = {
  Wrapper,
  WidgetWrapper,
  FixedWrapper,
  Spinner
};

export default Loader;
