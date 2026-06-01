type Primitive = string | number | boolean | null | undefined;

function appendValue(
  searchParams: URLSearchParams,
  key: string,
  value: Primitive | Primitive[],
  arrayFormat = "repeat"
) {
  if (Array.isArray(value)) {
    value.forEach(item => {
      if (arrayFormat === "comma") {
        return;
      }

      searchParams.append(key, item == null ? "" : String(item));
    });

    if (arrayFormat === "comma") {
      searchParams.append(
        key,
        value.map(item => (item == null ? "" : String(item))).join(",")
      );
    }

    return;
  }

  searchParams.append(key, value == null ? "" : String(value));
}

export const stringify = (
  params: Record<string, Primitive | Primitive[]>,
  options?: { arrayFormat?: "repeat" | "comma" }
) => {
  const searchParams = new URLSearchParams();
  const arrayFormat = options?.arrayFormat ?? "repeat";

  Object.entries(params ?? {}).forEach(([key, value]) => {
    appendValue(searchParams, key, value, arrayFormat);
  });

  return searchParams.toString();
};

export default { stringify };
