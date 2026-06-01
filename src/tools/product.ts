export const getAdvancedSearchInitialState = (model?: any[]) => {
  const initialState: Record<string, any> = {
    isPlaced: [""]
  };

  if (Array.isArray(model)) {
    model.forEach(item => {
      if (item?.id && !(item.id in initialState)) {
        initialState[item.id] = [];
      }
      if (Array.isArray(item?.ids)) {
        item.ids.forEach((id: string) => {
          if (!(id in initialState)) {
            initialState[id] = [];
          }
        });
      }
    });
  }

  return initialState;
};

export const buildRating = (value: number) => {
  const safe = Math.max(0, Math.min(5, Number(value) || 0));
  return Array.from({ length: 5 }, (_, index) => {
    const diff = safe - index;
    if (diff >= 1) return "fill100";
    if (diff >= 0.75) return "fill75";
    if (diff >= 0.5) return "fill50";
    if (diff >= 0.25) return "fill25";
    return "fill0";
  });
};

export const getDefaultOperationType = (marketPlace: any) => ({
  defaultMarketType:
    marketPlace?.marketTypeWrapper?.defaultMarketType ?? "SECONDARY",
  defaultOperationType:
    marketPlace?.marketTypeWrapper?.defaultOperationType ?? "BUY"
});

export const getDefaultMarketPrice = (marketPlace: any) => ({
  marketPrice: marketPlace?.marketPrice ?? 0,
  marketPriceInCurrency: marketPlace?.marketPriceInCurrency ?? 0
});
