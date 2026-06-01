export const checkBreakpoint = () => {
  const width = window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
};

export const checkDevice = () => {
  const breakpoint = checkBreakpoint();

  if (breakpoint === "mobile") {
    return "mobile";
  }

  if (breakpoint === "tablet") {
    return "tablet";
  }

  return "desktop";
};
