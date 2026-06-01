import React, { FC } from "react";
import "./FilterButtons.scss";

export interface IFilters {
  id?: string;
  name?: string;
  clicked?: Function;
}

export interface IProps {
  filters: Array<IFilters> | null;
  active: IFilters | null;
  disabled?: boolean;
  big?: boolean;
  className?: string;
}

const FilterButtons: FC<IProps> = ({
  filters,
  active,
  disabled,
  big,
  className
}) => {
  return (
    filters &&
    filters.length > 0 && (
      <div className={`filterButtons__wrapper ${className || ""}`}>
        <div className={`filterButtons ${big ? "filterButtons--big" : ""}`}>
          {filters.map(filter => (
            <FilterToggleButton
              id={filter.id}
              name={filter.name ?? ""}
              active={
                !!(
                  active &&
                  (active.id === filter.id || active.name === filter.name)
                )
              }
              key={filter.id ?? filter.name}
              clicked={filter.clicked}
              big={big}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    )
  );
};

interface IButton {
  id?: string;
  name: string;
  active: boolean;
  clicked?: Function;
  disabled?: boolean;
  big?: boolean;
  className?: string;
}

export const FilterToggleButton: FC<IButton> = ({
  id,
  name,
  active,
  clicked = () => null,
  disabled,
  className,
  big
}) => {
  return (
    <div
      className={`filterToggleButton__wrapper ${
        big ? "filterToggleButton__wrapper--big" : ""
      } ${className || ""}`}
    >
      <div
        className={`filterToggleButton ${
          big ? "filterToggleButton--big" : ""
        } ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
        onClick={e => {
          if (!disabled) clicked(e, name, id);
        }}
      >
        <span>{name}</span>
      </div>
    </div>
  );
};

export default FilterButtons;
