import React from "react";

const BestInClass = ({ bic }: { bic?: string | null }) => {
  return <span>{bic ?? "--"}</span>;
};

export default BestInClass;
