/* eslint-disable array-callback-return */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import AccordionIcon from "assets/icon/22/accordion-form.svg";
import { TransactionStatusGroupI } from "model/proposal";
import React, { ReactElement, useEffect } from "react";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import "./CustomSelect2.scss";

export interface ICustomSelectOption {
  value: any;
  label: string | ReactElement;
  subLabel?: string;
}

export interface ICustomerModelPortfolioData {
  consultingType: string;
  cluster: string;
  knowledgeProfile: string;
  riskProfile: string;
}

export interface IComponentFiltersResponseData {
  customerModelPortfolioDTO: ICustomerModelPortfolioData;
  parameterizationValueDTOList: ICustomSelectOption[];
}

interface IProps {
  selected: ICustomSelectOption | string | ICustomSelectOption[] | string[];
  onChange: Function;
  onClick?: Function;
  options: any;
  inputValue?: string;
  onInputChange?: Function;
  placeholder?: string | ReactElement;
  className?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
  addStyles?: any;
  isMulti?: any;
  isGetValueActive?: boolean;
  isClearable?: boolean;
  isCreatable?: boolean;
  hasErrors?: boolean;
  menuOpenCallBack?: Function;
  whiteIndicator?: boolean;
  hideIndicator?: boolean;
  formatGroupLabel?: any;
  onMenuOpen?: Function;
  hasGroupedOptions?: boolean;
  isSearchable?: boolean;
  isAML?: boolean;
  hasSubLabel?: boolean;
}

export const CustomSelect2: React.FC<IProps> = props => {
  const {
    className = "",
    width = "100%",
    height = "auto",
    addStyles = { input: {}, value: {}, options: {}, menu: {}, menuList: {} },
    onClick = () => null,
    isGetValueActive = true,
    menuOpenCallBack = () => null,
    formatGroupLabel = null,
    hasGroupedOptions = false
  } = props;

  const [isOpen, toggleOpen] = React.useState(false);
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);
  const [creatableOptions, setCreatableOptions] = React.useState(
    props?.options || []
  );

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

  useEffect(() => {
    if (props?.isCreatable && creatableOptions) {
      if (
        props?.selected &&
        !creatableOptions.find(option => option.value == props.selected)
      ) {
        setCreatableOptions([
          ...creatableOptions,
          { value: props.selected, label: props.selected }
        ]);
      }
    }
  }, [props.isCreatable, creatableOptions]);

  useEffect(() => {
    if (props.options && props.options.length > 0) {
      setCreatableOptions(props.options);
    }
  }, [props.options]);

  const handleChange = (item: ICustomSelectOption | ICustomSelectOption[]) => {
    toggleOpen(false);
    let changeValue = null;
    if (item && Array.isArray(item)) {
      changeValue = item.map(option => option.value);
    } else {
      changeValue = (item as ICustomSelectOption)?.value;
    }
    props.onChange(changeValue);
    if (props?.isAML && menuIsOpen && selectInnerRef) {
      setMenuIsOpen(false);
    }
  };

  const handleOutsideClick = (e: any) => {
    if (selectRef.current?.contains(e.target)) return;
    toggleOpen(false);
  };

  const handleCreateOptions = (value: any) => {
    const prevOptions = [...creatableOptions];
    const newOption = {
      label: value,
      value: value
    };
    setCreatableOptions([...prevOptions, newOption]);
    handleChange(newOption);
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleOpen(false);
    if (onClick && typeof onClick === "function") {
      onClick(e);
    }
  };

  const CustomOption = (optionProps: any) => {
    const { data } = optionProps;

    if (!data.subLabel) {
      return <components.Option {...optionProps} />;
    }

    return (
      <components.Option {...optionProps}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{data.label}</span>
          <span
            style={{
              fontSize: "12px",
              opacity: 0.7
            }}
          >
            {data.subLabel}
          </span>
        </div>
      </components.Option>
    );
  };

  const customComponents = {
    DropdownIndicator: () => (
      <span
        className={`customSelect2_customIndicator ${
          props.whiteIndicator ? "whiteIndicator" : ""
        } ${props.hideIndicator ? "hiddenIndicator" : ""} ${
          props.disabled ? "disabledIndicator" : ""
        }`}
      >
        <img src={AccordionIcon} alt="" />
      </span>
    ),
    IndicatorSeparator: () => <div></div>,
    Option: CustomOption
  };

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      width: "100%",
      height: "100%",
      backgroundColor: props.disabled ? "#f5f6f8" : "#fff",
      fontFamily: "Roboto",
      fontSize: "14px",
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
      ...addStyles.menu,
      backgroundColor: "#FFF",
      borderRadius: "10px",
      padding: "10px",
      boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.15)",
      zIndex: 9999
    }),
    menuList: (provided: any) => ({
      ...provided,
      ...addStyles.menuList,
      backgroundColor: "#FFF",
      borderRadius: "10px",
      zIndex: 9999
    })
  };

  const getValue = (
    selected: ICustomSelectOption | string | ICustomSelectOption[] | string[],
    options: ICustomSelectOption[] | TransactionStatusGroupI[],
    isCreatableValue = false,
    isMulti = false
  ) => {
    let valueOption = null;
    let selectOptions = options;
    if (hasGroupedOptions) {
      const flatOptions: any[] = [];
      (selectOptions as TransactionStatusGroupI[]).map(option => {
        option.options.forEach(op => flatOptions.push(op));
      });
      selectOptions = flatOptions;
    }
    if (selected && selectOptions && selectOptions.length > 0) {
      if (isMulti) {
        valueOption = [];
        if (selected && (selected as Array<any>).length > 0) {
          if ((selected as Array<any>).every(item => typeof item == "string")) {
            valueOption = (selected as Array<any>).map(item => {
              const selectedOption = (
                selectOptions as ICustomSelectOption[]
              ).find(o => o.value == item);
              if (selectedOption as ICustomSelectOption) return selectedOption;
            });
          } else if (
            (selected as Array<any>).every(item => typeof item == "object")
          ) {
            return selected;
          }
        }
      } else {
        const selectedOption = (selectOptions as ICustomSelectOption[]).find(
          o => o.value == selected
        );
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

  const handleFocus = () => setMenuIsOpen(true);
  const handleBlur = () => setMenuIsOpen(false);

  return (
    <div
      ref={selectRef}
      onClick={handleClick}
      className={`customSelect2 ${className}`}
    >
      {props.isCreatable ? (
        <CreatableSelect
          ref={selectInnerRef as any}
          value={getValue(
            props.selected,
            creatableOptions,
            false,
            props.isMulti
          )}
          placeholder={props.placeholder || "Seleziona"}
          onChange={handleChange as any}
          onCreateOption={handleCreateOptions}
          options={creatableOptions}
          components={customComponents as any}
          styles={customStyles as any}
          isDisabled={props.disabled}
          isOptionDisabled={(option: any) => option.disabled}
          noOptionsMessage={() => "nessun risultato"}
          isClearable={props.isClearable}
          formatCreateLabel={(inputValue: string) => `nuovo... ${inputValue}`}
        />
      ) : (
        <Select
          ref={selectInnerRef as any}
          value={
            isGetValueActive
              ? getValue(props.selected, props.options, false, props.isMulti)
              : props.selected
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...(props.isAML ? { menuIsOpen: menuIsOpen } : {})}
          formatGroupLabel={formatGroupLabel}
          inputValue={props.inputValue}
          placeholder={props.placeholder || "Seleziona"}
          onChange={handleChange as any}
          onInputChange={props.onInputChange as any}
          options={props.options}
          components={customComponents as any}
          styles={customStyles as any}
          isDisabled={props.disabled}
          isOptionDisabled={(option: any) => option.disabled}
          noOptionsMessage={() => "nessun risultato"}
          isSearchable={props.isSearchable}
          isMulti={props.isMulti}
          isClearable={props.isClearable}
          onMenuOpen={props.onMenuOpen as any}
          classNames={{
            control: () => "customSelect2__control"
          }}
        />
      )}
    </div>
  );
};
