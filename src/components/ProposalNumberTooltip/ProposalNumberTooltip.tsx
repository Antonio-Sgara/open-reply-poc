import React from "react";

export const TooltipWrapper = ({
  children,
  tooltipContent,
  showIcon = false
}: any) => {
  if (showIcon) {
    return <span title={tooltipContent}>i</span>;
  }

  return <span title={tooltipContent}>{children}</span>;
};
