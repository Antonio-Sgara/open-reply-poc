export const setDatasetColor = (type?: string) => {
  const colors: Record<string, string> = {
    FUND: "#264d7a",
    BOND: "#3d9ae2",
    STOCK: "#b2ce27",
    CASH: "#92a6bc"
  };

  return colors[type ?? ""] ?? "#264d7a";
};

export const stockOptions = [
  { id: "STOCK_GEOGRAPHIC", name: "Aree Geografiche" },
  { id: "STOCK_SECTOR_BASED", name: "Settori" }
];

export const bondOptions = [
  { id: "BOND_DURATION", name: "Duration" },
  { id: "BOND_RATING", name: "Rating" },
  { id: "BOND_SECTOR_BASED", name: "Tipologia" }
];

export const defaultSelected = {
  primary: { id: "STOCK", name: "Azionario" },
  secondary: stockOptions[0]
};

export const compOptions = [
  { id: "STOCK", name: "Azionario" },
  { id: "BOND", name: "Obbligazionario" }
];

export const faa2ndTableFilterCom = (item: any, secondaryId: string) => {
  return (
    item?.componentType === secondaryId ||
    item?.type === secondaryId ||
    item?.secondLevelType === secondaryId ||
    item?.category === secondaryId ||
    item?.name
  );
};

export const setRatingDatasetColor = (rating?: string) => {
  const normalized = `${rating ?? ""}`.toUpperCase();
  if (normalized.startsWith("AAA") || normalized.startsWith("AA")) {
    return "#57ab2d";
  }
  if (normalized.startsWith("A") || normalized.startsWith("BBB")) {
    return "#b2ce27";
  }
  if (normalized.startsWith("BB") || normalized.startsWith("B")) {
    return "#ffb900";
  }
  return "#92a6bc";
};
