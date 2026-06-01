import React, { FC } from "react";
import { PageTemplate } from "./page";
import { checkBreakpoint, checkDevice } from "styles/breakpoints";
import { useDispatch, useSelector } from "react-redux";
import { setBreakpointAction, setDeviceAction } from "store/responsive";

interface IProps {
  children?: React.ReactNode;
}

const PageTemplateContainerInner: FC<IProps> = props => {
  React.useEffect(() => {
    window.addEventListener("resize", getBreakpoint);
    getBreakpoint();
    return () => {
      window.removeEventListener("resize", getBreakpoint);
    };
    // eslint-disable-next-line
  }, []);

  const dispatch = useDispatch();

  const currentProfile = useSelector((state: any) => state?.currentProfile);

  const getBreakpoint = () => {
    let breakpoint = checkBreakpoint();
    let device = checkDevice();
    dispatch(setBreakpointAction(breakpoint));
    dispatch(setDeviceAction(device));
  };

  return <PageTemplate {...props} />;
};

export const PageTemplateContainer = PageTemplateContainerInner;
