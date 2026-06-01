export const isEmpty = (value: any) => {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === "string") {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
};

export const find = (collection: any[] = [], predicate: any) => {
  if (!Array.isArray(collection)) return undefined;
  return collection.find(item =>
    Object.keys(predicate ?? {}).every(key => item?.[key] === predicate[key])
  );
};

export const isEqual = (a: any, b: any) =>
  JSON.stringify(a) === JSON.stringify(b);

const lodashDefault = {
  isEmpty,
  find,
  isEqual
};

export default lodashDefault;
