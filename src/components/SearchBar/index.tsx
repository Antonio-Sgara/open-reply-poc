import React, { ReactNode, useEffect } from "react";
import SearchIcon from "assets/icon/22/search.svg";
import AdvancedSearchPanel, {
  AdvancedSearchPanelFilterProps,
  AdvancedSearchPanelModelProps
} from "components/AdvancedSearchPanel/AdvancedSearchPanel";
import { Collapse } from "react-bootstrap";
import SearchBarToggle from "./SearchBarToggle";
import "./SearchBar.scss";

export interface SearchBarProps {
  inputSearch?: any;
  placeholder?: string;
  handleSubmit?: Function;
  handleInputSearch?: Function;
  className?: string;
  advanced?: boolean;
  onFilter?: Function;
  onToggleFilters?: Function;
  onResetFilters?: Function;
  onApplyFilters?: Function;
  activeFilters?: AdvancedSearchPanelFilterProps;
  modelFilters?: AdvancedSearchPanelModelProps[];
  advancedClassName?: string;
  withSearchBar?: boolean;
  collapseTriggerClassName?: string;
  externalToggle?: boolean;
  externalToggleValue?: boolean;
  isLoadingOptions?: boolean;
  secondaryButton?: ReactNode;
  defaultFiltersChanged?: boolean;
  preventAutoClose?: boolean;
  hideCloseButton?: boolean;
  isShowingSecondary?: boolean;
  disableApplyButton?: boolean;
  warningInfo?: any;
  limitDropDownHeight?: boolean;
  advancedSearchClassName?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className = "",
  onToggleFilters = () => null,
  withSearchBar = true,
  externalToggle = false,
  externalToggleValue = false,
  isLoadingOptions = false,
  isShowingSecondary = false,
  disableApplyButton = false,
  limitDropDownHeight = false,
  advancedSearchClassName = "",
  ...props
}) => {
  const [isOpenAdvanced, toggleOpenAdvanced] = React.useState(false);

  useEffect(() => {
    if (isShowingSecondary) {
      toggleOpenAdvanced(true);
      onToggleFilters(true, {});
    } else {
      toggleOpenAdvanced(false);
    }
  }, []);

  const handleToggle = (toggle: boolean, currentFilters?: any) => {
    toggleOpenAdvanced(toggle);
    onToggleFilters(toggle, currentFilters);
  };

  return (
    <div className={`SearchBar__wrapper ${props.advanced ? "advanced " : ""}`}>
      <div className={`SearchBar__section`}>
        {withSearchBar && (
          <div className={`SearchBar ${className}`}>
            <form
              className="SearchBar__form"
              onSubmit={e => {
                e.preventDefault();
                props.handleSubmit?.(e, props.inputSearch);
              }}
            >
              <input
                className="SearchBar__input"
                type="text"
                placeholder={props.placeholder}
                value={props.inputSearch}
                onChange={e => {
                  props.handleInputSearch?.(e.target.value);
                }}
              />
              <div className="SearchBar__icon">
                <img
                  src={SearchIcon}
                  width={20}
                  height={20}
                  alt=""
                  onClick={e => props.handleSubmit?.(e, props.inputSearch)}
                />
              </div>
            </form>
          </div>
        )}
        {props.advanced && !externalToggle && (
          <SearchBarToggle
            handleToggle={handleToggle}
            isOpenAdvanced={isOpenAdvanced}
            collapseTriggerClassName={props.collapseTriggerClassName}
          />
        )}
      </div>
      <Collapse
        in={
          !!(
            props.advanced &&
            (isOpenAdvanced || (externalToggle && externalToggleValue))
          )
        }
      >
        <div className={`SearchBar__advancedSearch ${advancedSearchClassName}`}>
          <AdvancedSearchPanel
            filters={props.activeFilters}
            model={props.modelFilters}
            onFilter={props.onFilter}
            onResetFilters={props.onResetFilters}
            onApplyFilters={props.onApplyFilters}
            onClose={() => {
              externalToggle ? onToggleFilters() : handleToggle(false);
            }}
            className={props.advancedClassName}
            isLoadingOptions={isLoadingOptions}
            secondaryButton={props.secondaryButton}
            defaultFiltersChanged={props.defaultFiltersChanged}
            preventAutoClose={props.preventAutoClose}
            disableApplyButton={disableApplyButton}
            limitDropDownHeight={limitDropDownHeight}
            hideCloseButton={props?.hideCloseButton}
            warningInfo={props?.warningInfo}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default SearchBar;
