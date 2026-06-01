import { useRef, useEffect } from "react";
import { ndgMinifier } from "./proposal/proposal";
export const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.toLowerCase().slice(1);
};

export const getFullName = (person: any, noWhiteSpace?: boolean) =>
  person.name && person.surname
    ? String(person.name) +
      `${noWhiteSpace ? "\u00A0" : " "}` +
      String(person.surname)
    : "N.D.";
export const getFullNameFromCustomer = (
  person: any,
  customer: any,
  noWhiteSpace?: boolean
) => {
  const relatedSubject = customer.relatedSubjects.find(
    (relatedSubject: any) =>
      ndgMinifier(relatedSubject.ndg) === ndgMinifier(person.ndg)
  );
  return relatedSubject.name && relatedSubject.surname
    ? String(relatedSubject.name) +
        `${noWhiteSpace ? "\u00A0" : " "}` +
        String(relatedSubject.surname)
    : "N.D.";
};
/**
 * returns a number with min precision = 2, max precision = 4,
 * depending on the first significant floating digit
 **/
export const variableFloatingPoint = (num: number, withSign = false) => {
  if (!isFinite(num) || num === null || num === 0) return "0,00";
  let formattedValue;

  let numProcessedArray = num
    .toString()
    .replace(".", "")
    .split("");
  if (
    numProcessedArray[0] === "0" &&
    // eslint-disable-next-line
    [...numProcessedArray].findIndex(character => character != "0") == 3
  )
    formattedValue = num.toLocaleString("it-IT", { minimumFractionDigits: 3 });
  else if (
    numProcessedArray[0] === "0" &&
    // eslint-disable-next-line
    [...numProcessedArray].findIndex(character => character != "0") > 3
  )
    formattedValue = num.toLocaleString("it-IT", { minimumFractionDigits: 4 });
  else
    formattedValue = num.toLocaleString("it-IT", {
      minimumFractionDigits: 2
    });

  return withSign && Number(num) > 0 ? `+${formattedValue}` : formattedValue;
};
export const unboundVariableFloatingPoint = (
  num: number,
  minimumFractionDigits = 0,
  maximumFractionDigits?: number
) => {
  if (!isFinite(num) || num === null) return "0";
  let maximumDigits = 20,
    numProcessedArray = num
      .toString()
      .replace(".", "")
      .split(""),
    firstSignificantIndex = 0;
  if (
    num < 1 &&
    numProcessedArray.find(char => char === "e") &&
    numProcessedArray.find(char => char === "-")
  )
    firstSignificantIndex = parseInt(
      num.toString().slice(num.toString().indexOf("-") + 1)
    );
  else if (numProcessedArray[0] === "0")
    firstSignificantIndex = [...numProcessedArray].findIndex(
      // eslint-disable-next-line
      character => character != "0"
    );
  // eslint-disable-next-line
  if (firstSignificantIndex == -1) return "0";
  else if (firstSignificantIndex > minimumFractionDigits)
    maximumDigits = firstSignificantIndex;
  return num.toLocaleString("it-IT", {
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits
      ? maximumFractionDigits
      : maximumDigits
  });
};

export const isLocalhost = () =>
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

//custom hook to access prev value
export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const openUrl = url => {
  window.open(url ? url : "", "_blank");
};

export const getLeaderId = (relatedSubjects: any[] = []) => {
  if (relatedSubjects.length > 0) {
    let leaderId: string | null = null;
    for (let i = 0; i < relatedSubjects.length; i++) {
      if (relatedSubjects[i].leader) {
        leaderId = relatedSubjects[i].customerId;
        break;
      }
    }
    return leaderId;
  } else return null;
};

export const extractIsinFromMessage = (details: string, products: string[]) => {
  const isin = [];
  let cleanMessage = details;
  products.forEach(product => {
    if (cleanMessage.includes(`${product}, `)) {
      isin.push(product);
      cleanMessage = replaceAll(cleanMessage, `${product}, `, "");
    } else if (cleanMessage.includes(product)) {
      isin.push(product);
      cleanMessage = replaceAll(cleanMessage, product, "");
    }
  });
  return [cleanMessage, [...isin]];
};

export const RISK_CLASS_GROUP_STRING = "La classe ";
export const RISK_CLASS_STRING = "Classe di rischio ";

export const cleanAlertDetails = (details: string[], ptfProducts: any[]) => {
  const cleanDetails = [];
  try {
    const ptfIsin = extractIsinListFromPtf(ptfProducts);
    // eslint-disable-next-line
    details.map(detail => {
      if (detail.includes(RISK_CLASS_STRING)) {
        cleanDetails.push(detail);
        // to break line after each risk class
        // detail.split(RISK_CLASS_STRING).map((part, index) => {
        //   if (index > 0) {
        //     part = RISK_CLASS_STRING + part;
        //   }

        //   if (part.includes(RISK_CLASS_GROUP_STRING)) {
        //     const [first, second] = part.split(RISK_CLASS_GROUP_STRING);
        //     cleanDetails.push(first);
        //     cleanDetails.push(RISK_CLASS_GROUP_STRING + second);
        //   } else {
        //     cleanDetails.push(part);
        //   }
        // });
      } else {
        const splitDetails = extractIsinFromMessage(detail, ptfIsin);
        cleanDetails.push(splitDetails[0]);
        cleanDetails.push(...splitDetails[1]);
      }
    });
    return cleanDetails;
  } catch (error) {
    return details;
  }
};
export const cleanSustainabilityMetadata = (metadata: any) => {
  const cleanMetadata = [];
  try {
    const {
      ecoSustainabilityComment,
      sustainabilityComment,
      principalAdvImpactComment
    } = metadata;
    if (!!ecoSustainabilityComment) {
      cleanMetadata.push({
        title: "Eco-sostenibilitá",
        content: ecoSustainabilityComment
      });
    }
    if (!!sustainabilityComment) {
      cleanMetadata.push({
        title: "Sostenibilitá",
        content: sustainabilityComment
      });
    }
    if (!!principalAdvImpactComment) {
      cleanMetadata.push({
        title: "Impatti avversi",
        content: principalAdvImpactComment
      });
    }
    return cleanMetadata;
  } catch (error) {
    return [];
  }
};

export const extractIsinListFromPtf = (ptfProducts: any[]) => {
  return [...ptfProducts.map(product => product.positionIdentifier.isin)];
};

export const replaceAll = (str, find, replace) => {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

export interface INextPageOptions {
  defaultSearchSize: number;
  totalElements: number;
  numberOfElements: number;
  totalPages: number;
  currentPage: number;
  setNextPageElements: (a: number) => void;
}

export const computeNumberOfNextElements = (options: INextPageOptions) => {
  const {
    defaultSearchSize,
    totalElements,
    numberOfElements,
    totalPages,
    currentPage,
    setNextPageElements
  } = options;

  if (
    totalElements == null ||
    numberOfElements == null ||
    totalPages == null ||
    currentPage == null
  ) {
    setNextPageElements(defaultSearchSize);
  }

  if (totalElements <= defaultSearchSize) {
    // lastPage should be true, this value must not be visible
    setNextPageElements(0);
  }
  // the elements that are not shown
  const numberOfNextElements =
    totalElements - (currentPage + 1) * defaultSearchSize;

  if (numberOfNextElements < defaultSearchSize && numberOfNextElements > 0) {
    setNextPageElements(numberOfNextElements);
  } else {
    setNextPageElements(defaultSearchSize);
  }
};

export const spliceIntoChunks = (list, size) => {
  const res = [];
  while (list.length > 0) {
    const chunk = list.splice(0, size);
    res.push(chunk);
  }
  return res;
};

export const getLogErrorMessage = error => {
  let stringError =
    error?.toString() +
    " " +
    error?.stack
      ?.split("\n")[1]
      ?.trim()
      ?.replace(/\s*\(.*?\)/, "");
  return stringError.toString();
};
