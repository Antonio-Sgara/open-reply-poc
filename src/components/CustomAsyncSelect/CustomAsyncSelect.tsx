import React, { ReactElement, useEffect } from "react";
import { components } from "react-select";
import AsyncSelect from "react-select/async";
import AccordionIcon from "assets/icon/22/accordion-form.svg";
import "./CustomAsyncSelect.scss";

export interface ICustomSelectOption {
  value: any;
  label: string | ReactElement;
}

interface IProps {
  selected: ICustomSelectOption | string | ICustomSelectOption[] | string[];
  onChange: Function;
  onClick?: Function;
  options: any;
  maxOptions?: number;
  placeholder?: string | ReactElement;
  className?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
  addStyles?: any;
  isMulti?: any;
  isGetValueActive?: boolean;
  isClearable?: boolean;
  hasErrors?: boolean;
  menuOpenCallBack?: Function;
  whiteIndicator?: boolean;
  hideIndicator?: boolean;
  formatGroupLabel?: any;
  noOptionsMessage?: string;
  onInputChange?: (input: string) => void;
}

export const CustomAsyncSelect: React.FC<IProps> = ({
  maxOptions = 50,
  ...props
}) => {
  const {
    className = "",
    width = "100%",
    height = "auto",
    addStyles = { input: {}, value: {}, options: {}, menuList: {} },
    onClick = () => null,
    isGetValueActive = true,
    menuOpenCallBack = () => null,
    formatGroupLabel = null
  } = props;

  const [isOpen, toggleOpen] = React.useState(false);
  const [optionsCount, setOptionsCount] = React.useState(0);

  const selectRef = React.useRef<HTMLDivElement>(undefined as any);
  const selectInnerRef = React.useRef<any>(undefined as any);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    menuOpenCallBack(isOpen);
  }, [isOpen]);

  const handleChange = (item: ICustomSelectOption | ICustomSelectOption[]) => {
    toggleOpen(false);
    let changeValue = null;
    if (item && Array.isArray(item)) {
      changeValue = item.map(option => option.value);
    } else {
      changeValue = (item as ICustomSelectOption)?.value;
    }
    props.onChange(changeValue);
  };

  const handleOutsideClick = (e: any) => {
    if (selectRef.current?.contains(e.target)) return;
    toggleOpen(false);
    setOptionsCount(0);
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleOpen(!isOpen);
    onClick(e);
  };

  const customComponents = {
    DropdownIndicator: () => (
      <span
        className={`customSelect2_customIndicator ${
          props.whiteIndicator ? "whiteIndicator" : ""
        } ${props.hideIndicator ? "hiddenIndicator" : ""}`}
      >
        <img src={AccordionIcon} alt="" />
      </span>
    ),
    IndicatorSeparator: () => <div></div>,
    Menu: (menuProps: any) => {
      return (
        <components.Menu {...menuProps}>
          {optionsCount == maxOptions && !menuProps.isLoading && (
            <span className="customAsyncSelect__menuCount">
              {`Primi ${maxOptions} risultati`}
            </span>
          )}
          {menuProps.children}
        </components.Menu>
      );
    }
  };

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      width: "100%",
      height: "100%",
      backgroundColor: props.disabled ? "#f5f6f8" : "#fff",
      fontFamily: "Roboto",
      fontSize: "16px",
      borderStyle: "solid",
      borderWidth: props.disabled ? 0 : "1px",
      borderColor: props.hasErrors ? "#FE170F" : "#e9edf2",
      borderRadius: "2px",
      boxShadow: "none",
      ...addStyles.input
    }),
    container: (provided: any) => ({
      ...provided,
      width: width,
      height: height,
      ...addStyles.container
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontFamily: "Roboto",
      color: "#262626",
      ...addStyles.value
    }),
    IndicatorsContainer: (provided: any) => ({
      ...provided,
      paddingRight: "10px",
      borderRadius: "20px",
      ...addStyles.value
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      ...addStyles.dropdownIndicator
    }),
    groupHeading: () => ({
      padding: 0
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      ...addStyles.options,
      fontFamily: "Roboto",
      textAlign: "left",
      fontSize: "16px",
      zIndex: 9999999,
      background: state.isSelected
        ? "#264d7a"
        : state.isFocused
          ? "#f1f4f7"
          : "#fff",
      color: state.isSelected
        ? "#fff"
        : state.isDisabled
          ? "#c0c0c0"
          : "#373737",
      padding: "5px",
      borderRadius: "5px"
    }),
    placeholder: (provided: any) => ({
      ...provided,
      ...addStyles.placeholder
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#FFF",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.15)"
    }),
    menuList: (provided: any) => ({
      ...provided,
      ...addStyles.menuList,
      backgroundColor: "#FFF",
      borderRadius: "10px"
    })
  };

  const getValue = (
    selected: ICustomSelectOption | string | ICustomSelectOption[] | string[],
    options: ICustomSelectOption[],
    isCreatableValue = false,
    isMulti = false
  ) => {
    let valueOption = null;
    if (selected && options && options.length > 0) {
      if (isMulti) {
        valueOption = [];
        if (selected && (selected as Array<any>).length > 0) {
          if ((selected as Array<any>).every(item => typeof item == "string")) {
            valueOption = (selected as Array<any>).map(item => {
              const selectedOption = options.find(o => o.value == item);
              if (selectedOption as ICustomSelectOption) return selectedOption;
            });
          } else if (
            (selected as Array<any>).every(item => typeof item == "object")
          ) {
            return selected;
          }
        }
      } else {
        const selectedOption = options.find(o => o.value == selected);
        if (selectedOption as ICustomSelectOption) {
          valueOption = selectedOption;
        } else if (isCreatableValue) {
          valueOption = {
            value: selected,
            label: selected
          };
        }
      }
    }
    return valueOption;
  };

  const filterOptions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
    return inputLength === 0
      ? []
      : props.options.filter((option: any) => {
          const keep =
            count < maxOptions &&
            (option.value.toLowerCase().indexOf(inputValue.toLowerCase()) >=
              0 ||
              option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >=
                0);
          if (keep) {
            count += 1;
          }
          return keep;
        });
  };

  const promiseOptions = (inputValue: string) =>
    new Promise(resolve => {
      const options = filterOptions(inputValue);
      resolve(options);
      setOptionsCount(options.length);
    });

  return (
    <div
      ref={selectRef}
      onClick={handleClick}
      className={`customSelect2 ${className}`}
    >
      <AsyncSelect
        ref={selectInnerRef as any}
        loadOptions={promiseOptions as any}
        value={
          isGetValueActive
            ? getValue(props.selected, props.options, false, props.isMulti)
            : props.selected
        }
        formatGroupLabel={formatGroupLabel}
        placeholder={props.placeholder}
        components={customComponents as any}
        styles={customStyles as any}
        isDisabled={props.disabled}
        isOptionDisabled={(option: any) => option.disabled}
        noOptionsMessage={() => props.noOptionsMessage ?? "nessun risultato"}
        isClearable={props.isClearable}
        isMulti={props.isMulti}
        isSearchable={true}
        onChange={handleChange as any}
        onInputChange={(input: string) => {
          props.onInputChange?.(input);
          setOptionsCount(0);
        }}
        loadingMessage={() => "Ricerca in corso..."}
      />
    </div>
  );
};
