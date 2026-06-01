/* eslint-disable eqeqeq */
import React, { useState, useCallback } from "react";
import "./Sorter.scss";

interface IProps {
  name: string | React.ReactElement;
  value?: number;
  className?: string;
  disabled?: boolean;
  onSort?: (a: string, b: string) => void;
  sortKey?: string;
  onToggle?: Function;
  current?: string;
  sortStep?: string;
  perColumn?: boolean;
  sortable?: boolean;
}

export const orderSorting = ["ASC", "DESC", "RESET"];

const Sorter: React.FC<IProps> = ({
  className,
  disabled,
  name,
  onSort,
  current,
  sortKey,
  sortStep = "RESET",
  perColumn,
  sortable = true
}) => {
  const [step, setStep] = useState(orderSorting.indexOf(sortStep));

  const onSortToggle = useCallback(() => {
    let next;
    if (perColumn && sortKey !== current) {
      next = 0;
    } else {
      next = step === orderSorting.length - 1 ? 0 : step + 1;
    }
    setStep(next);
    onSort?.(sortKey || "", orderSorting[next]);
  }, [current, onSort, perColumn, sortKey, step]);

  if (!sortable) {
    return <span className={className ? className : ""}>{name}</span>;
  }

  return (
    <div className={`sorter ${className ? className : ""}`}>
      <button
        type="button"
        className={"sorter__mainButton"}
        onClick={onSortToggle}
        disabled={disabled}
      >
        <span className="sorter__label">{name}</span>
        <div className="sorter__wrapperButtons">
          <div
            className={`sorter__wrapperButton ${
              orderSorting[step] === orderSorting[0] && current == sortKey
                ? "active"
                : ""
            }`}
          >
            <span className="sorter__button sorter__button--plus icon-document-mancante" />
          </div>
          <div
            className={`sorter__wrapperButton ${
              orderSorting[step] === orderSorting[1] && current == sortKey
                ? "active"
                : ""
            }`}
          >
            <span className="sorter__button sorter__button--less icon-accordion-form" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default Sorter;
