import React, { FC } from "react";
import { Dropdown } from "react-bootstrap";
import "./FilterDropdown.scss";

interface IDropdownItem {
  name: string;
  id: string;
  clicked?: any;
}

interface IProps {
  options: IDropdownItem[];
  selected: IDropdownItem;
  onSelect?: (eventKey: string | null, event: any) => void;
  className?: string;
  buttonClassName?: string;
  dropdownClass?: string;
}

export const FilterDropdown: FC<IProps> = ({
  options,
  selected,
  onSelect = () => {},
  className = "",
  buttonClassName = "",
  dropdownClass = ""
}) => {
  return (
    <div className={`filterToggleButton__wrapper ${className}`}>
      <Dropdown title={selected.name} onSelect={onSelect}>
        <Dropdown.Toggle
          id="filter-dropdown-toggle"
          className={`filterToggleDropdown__toggle ${buttonClassName}`}
          variant="secondary"
        >
          {selected.name}
        </Dropdown.Toggle>
        <Dropdown.Menu className={`${dropdownClass} dropdown-menu-left`}>
          {options.map(item => (
            <Dropdown.Item
              as="button"
              className="filterToggleDropdown__item"
              active={item.id === selected.id}
              key={item.id}
              eventKey={item.id}
              onClick={event => item.clicked?.(event, item.name, item.id)}
            >
              {item.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default FilterDropdown;
