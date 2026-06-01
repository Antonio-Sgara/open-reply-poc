import React from "react";

const IconWithPopover = ({ popover }: { popover?: { content?: React.ReactNode } }) => (
  <span title={typeof popover?.content === "string" ? popover.content : undefined}>
    i
  </span>
);

export default IconWithPopover;
