import React from "react";

interface SearchBarToggleProps {
  handleToggle: Function;
  isOpenAdvanced: boolean;
  collapseTriggerClassName?: string;
}

const SearchBarToggle: React.FC<SearchBarToggleProps> = ({
  handleToggle,
  isOpenAdvanced,
  collapseTriggerClassName = ""
}) => {
  return (
    <div
      className={`SearchBar__advancedToggle ${collapseTriggerClassName}`}
      onClick={() => handleToggle(!isOpenAdvanced)}
    >
      <span>RICERCA AVANZATA&nbsp;</span>
      {isOpenAdvanced ? (
        <span className="icon-investi"></span>
      ) : (
        <span className="icon-disinvesti"></span>
      )}
    </div>
  );
};

export default SearchBarToggle;
