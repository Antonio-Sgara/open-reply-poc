import React from "react";
import messages from "localization/index";

const interpolateMessage = (template: any, values?: Record<string, any>) => {
  if (template == null) return "";
  if (values == null) return template;
  const source = String(template);
  const parts = source.split(/(\{[^}]+\})/g);
  return parts.map((part, index) => {
    const match = part.match(/^\{([^}]+)\}$/);
    if (!match) return <React.Fragment key={index}>{part}</React.Fragment>;
    const key = match[1];
    return <React.Fragment key={index}>{values[key] ?? part}</React.Fragment>;
  });
};

export const FormattedDate = ({
  value,
  weekday,
  day,
  month,
  year
}: any) => {
  const date = value instanceof Date ? value : new Date(value);
  return (
    <>
      {new Intl.DateTimeFormat("it-IT", {
        weekday,
        day,
        month,
        year
      }).format(date)}
    </>
  );
};

export const FormattedMessage = ({ id, defaultMessage, values }: any) => (
  <>{interpolateMessage(messages[id] ?? defaultMessage ?? id, values)}</>
);

export const useIntl = () => ({
  formatMessage: ({ id, defaultMessage }: any, values?: any) => {
    const template = messages[id] ?? defaultMessage ?? id;
    if (!values) return template;
    return String(template).replace(/\{([^}]+)\}/g, (_: string, key: string) =>
      values[key] ?? `{${key}}`
    );
  }
});
