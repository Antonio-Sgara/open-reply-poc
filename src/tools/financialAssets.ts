export const setDatasetColor = (type?: string) => {
  const colors: Record<string, string> = {
    FUND: "#264d7a",
    BOND: "#3d9ae2",
    STOCK: "#b2ce27",
    CASH: "#92a6bc"
  };

  return colors[type ?? ""] ?? "#264d7a";
};
