import React from "react";
import { ICustomSelectOption } from "./CustomSelect2";
import { isEmpty } from "lodash";

export const CustomSelectWrapper = ({
  children,
  className = ""
}: {
  children?: React.ReactNode;
  className?: string;
}) => <div className={`CustomSelect__wrapper ${className}`}>{children}</div>;

export function getSelected(obj: any) {
  return obj.id > -1
    ? {
        value: JSON.stringify(obj),
        label: obj.name
      }
    : null;
}

export const getOptionsFromEnum = (enumObject: any): ICustomSelectOption[] => {
  if (isEmpty(enumObject)) return [];
  return Object.keys(enumObject).map(key => ({
    value: key,
    label: enumObject[key]
  }));
};

export const getOptionsFromEnumWithIcons = (
  enumObject: any,
  enumIcons: any
): ICustomSelectOption[] => {
  if (isEmpty(enumObject)) return [];
  return Object.keys(enumObject).map(key => ({
    value: key,
    label: (
      <>
        {enumIcons[key]} {enumObject[key]}
      </>
    )
  }));
};

export const getOptionsFromArray = (
  array: any,
  enumObject: any
): ICustomSelectOption[] => {
  if (isEmpty(array)) return [];

  return array.map((key: any) => ({
    value: key,
    label: enumObject[key]
  }));
};

export const translateOptions = (
  options: ICustomSelectOption[],
  commonKey: string,
  intl: any
): ICustomSelectOption[] => {
  if (isEmpty(options)) return [];
  return options.map(option => ({
    ...option,
    label: translateLabel(`${commonKey}.${option.value}`, intl)
  }));
};

export const translateLabel = (id: string, intl: any) =>
  intl.formatMessage({ id });

export const yesNoOptions = [
  {
    value: "true",
    label: "Si"
  },
  {
    value: "false",
    label: "No"
  }
];

export const getOptionsFromArrayNoEnum = (
  array: any
): ICustomSelectOption[] => {
  if (isEmpty(array)) return [];
  return array.map((key: any) => ({
    value: key,
    label: key
  }));
};
