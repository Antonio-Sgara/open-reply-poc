import Button from "components/Button";
import { CustomAsyncSelect } from "components/CustomAsyncSelect/CustomAsyncSelect";
import {
  CustomSelect2,
  ICustomSelectOption
} from "components/CustomSelect2/CustomSelect2";
import { SelectWithColumns } from "components/SelectWithColumns/SelectWithColumns";
import { Switch } from "components/SwitchToggle/SwitchToggle";
import { TransactionStatusGroupI } from "model/proposal";
import * as React from "react";
import InfoIcon from "../../assets/icon/notification/info.svg";
import CustomDatePicker from "../CustomDatePicker/CustomDatePicker";
import CustomInput from "../CustomInput/CustomInput";
import { DateRangePicker } from "../DateRangePicker/DateRangePicker";
import Loader from "../Loader/Loader";
import SearchBarByFilters from "../SearchBarByFilters";
import { LOCALE } from "../constants";
import { isFiltersEmpty } from "./utils";
import "./AdvancedSearchPanel.scss";

export interface AdvancedSearchPanelFilterProps {
  [x: string]: any;
}
export interface AdvancedSearchPanelModelProps {
  id?: string;
  ids?: string[];
  label?: string;
  options?: ICustomSelectOption[] | TransactionStatusGroupI[];
  isMultiselect?: boolean;
  onClick?: Function;
  type?: AdvancedSearchPanelModelTypes;
  maxDate?: any;
  minDate?: any;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string | any;
  secondaryPlaceholder?: string;
  required?: boolean;
  formatGroupLabel?: (data: any) => Element;
  defaultValues?: any;
  maxRange?: string;
  enableFutureDates?: boolean;
  hide?: boolean;
  isSearchable?: boolean;
  icon?: string;
  colOptions?: any;
  colLabels?: any;
  expirationType?: string | string[];
  checkDisabledValues?: Function;
}

export enum AdvancedSearchPanelModelTypes {
  SELECT = "SELECT",
  ASYNC_SELECT = "ASYNC_SELECT",
  DATEPICKER = "DATEPICKER",
  RANGE_DATEPICKER = "RANGE_DATEPICKER",
  TEXT = "TEXT",
  SWITCH = "SWITCH",
  NUMBER = "NUMBER",
  GROUPED = "GROUPED",
  DOUBLE_INPUT = "DOUBLE_INPUT",
  CHECKBOX = "CHECKBOX",
  DATA = "DATA",
  OPTIONAL_NAME_SURNAME = "OPTIONAL_NAME_SURNAME",
  SELECT_COLUMNS = "SELECT_COLUMNS"
}

export interface AdvancedSearchPanelProps {
  filters: AdvancedSearchPanelFilterProps;
  model: AdvancedSearchPanelModelProps[];
  onClose?: Function;
  onFilter?: Function;
  onResetFilters?: Function;
  onApplyFilters?: Function;
  className?: string;
  isLoadingOptions?: boolean;
  secondaryButton?: React.ReactNode;
  defaultFiltersChanged?: boolean;
  hideCloseButton?: boolean;
  preventAutoClose?: boolean;
  disableApplyButton?: boolean;
  limitDropDownHeight?: boolean;
  warningInfo?: any;
}

export const parseFilter = (
  value: boolean | string | string[],
  type: AdvancedSearchPanelModelTypes
) => {
  return Array.isArray(value)
    ? value
    : type === AdvancedSearchPanelModelTypes.DATEPICKER ||
        type === AdvancedSearchPanelModelTypes.RANGE_DATEPICKER
      ? value
      : type === AdvancedSearchPanelModelTypes.DATA
        ? value
          ? value
          : null
        : value;
};

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  filters,
  model,
  onClose = (_e: Event) => null,
  onFilter = (_filterId: string, _value: string | string[]) => null,
  onResetFilters = (_e: Event) => null,
  onApplyFilters = (_e: Event) => null,
  className = "",
  isLoadingOptions = false,
  secondaryButton,
  defaultFiltersChanged = false,
  preventAutoClose = false,
  disableApplyButton = false,
  limitDropDownHeight = false,
  hideCloseButton = false,
  warningInfo = ""
}) => {
  const selectStyle = {
    container: { minHeight: "51px" },
    input: { minHeight: "51px", fontSize: "14px" }
  };
  const selectStyleLimited = {
    container: { minHeight: "51px" },
    input: { minHeight: "51px", fontSize: "14px" },
    menuList: { maxHeight: "250px" }
  };
  const [isFiltersChanged, toggleFiltersChanged] = React.useState(
    defaultFiltersChanged
  );

  const [isAsyncSelectPristine, setIsAsyncSelectPristine] = React.useState(
    true
  );

  const handleFilter = (
    filterId: string | string[],
    value: any,
    type?: AdvancedSearchPanelModelTypes
  ) => {
    const filterParams =
      filterId === "abiSet"
        ? value
          ? [value]
          : []
        : filterId === "nameOrSurname" &&
            type === AdvancedSearchPanelModelTypes.DOUBLE_INPUT
          ? value[0]
            ? value[0] + " " + value[1]
            : value[1]
          : value;

    onFilter(filterId, filterParams, type);
    toggleFiltersChanged(true);
  };

  const handleApply = (e: any) => {
    onApplyFilters();
    toggleFiltersChanged(false);
    if (isFiltersEmpty(filters) && !preventAutoClose) {
      onClose(e);
    }
  };

  const handleReset = (e: any) => {
    onResetFilters(e);
    toggleFiltersChanged(true);
  };

  const onAsyncInputChange = (input: string) => {
    setIsAsyncSelectPristine(!input || input.length === 0);
  };

  return (
    <div
      className={`AdvancedSearchPanel sectionWrapper sectionWrapper--blueLight ${className}`}
    >
      <div className="AdvancedSearchPanel__filters">
        {model &&
          model
            ?.filter(
              filter => filter?.type === AdvancedSearchPanelModelTypes.SWITCH
            )
            ?.map((filter, i) => (
              <div
                className="AdvancedSearchPanelFilters__filter d-flex align-items-center"
                style={{ gap: 20 }}
                key={`filter-switch-${i}`}
              >
                <label className={"m-0"}>
                  {filter.label}{" "}
                  {filter.required && (
                    <span className={"mandatoryAsterisk"}> *</span>
                  )}
                </label>
                <Switch
                  isOn={!!filters[filter?.id || ""]}
                  handleToggle={() =>
                    handleFilter(filter?.id || "", !filters[filter?.id || ""])
                  }
                />
              </div>
            ))}
      </div>
      <div className="AdvancedSearchPanel__filters">
        {model &&
          model
            ?.filter(
              filter => filter?.type !== AdvancedSearchPanelModelTypes.SWITCH
            )
            .map((filter, index) =>
              filter ? (
                <div
                  className="AdvancedSearchPanelFilters__filter"
                  key={`filter-${index}`}
                >
                  <label>
                    {filter.label}{" "}
                    {filter.required && (
                      <span className={"mandatoryAsterisk"}> *</span>
                    )}
                  </label>
                  {filter?.type === AdvancedSearchPanelModelTypes.DATEPICKER ? (
                    <CustomDatePicker
                      value={filters[filter.id || ""] || undefined}
                      onSelect={(date: any) =>
                        handleFilter(
                          filter.id || "",
                          date ? date.format(LOCALE.format) : date,
                          filter?.type
                        )
                      }
                      placeholder={filter?.placeholder || "Seleziona..."}
                      showYearDropdown={true}
                      hideArrowNav={true}
                      maxDate={filter.maxDate}
                      minDate={filter.minDate}
                      disabled={isLoadingOptions}
                    />
                  ) : filter?.type ===
                    AdvancedSearchPanelModelTypes.RANGE_DATEPICKER ? (
                    <DateRangePicker
                      selectedStartDate={filters[filter?.ids?.[0] || ""]}
                      selectedEndDate={filters[filter?.ids?.[1] || ""]}
                      enableFutureDates={filter?.enableFutureDates}
                      maxRange={filter?.maxRange}
                      className={"customDateRangePickerToggle"}
                      onClick={({ startDate, endDate }: any) => {
                        handleFilter(
                          filter.ids || [],
                          [startDate, endDate],
                          filter?.type
                        );
                      }}
                      disableRangesDropdown
                    />
                  ) : filter?.type === AdvancedSearchPanelModelTypes.TEXT ? (
                    <CustomInput
                      value={filters[filter.id || ""] || ""}
                      placeholder={"Inserisci ..."}
                      onChange={(e: any) =>
                        handleFilter(filter.id || "", e.target.value, filter?.type)
                      }
                      disabled={isLoadingOptions || filter?.disabled}
                    />
                  ) : filter?.type === AdvancedSearchPanelModelTypes.NUMBER ? (
                    <CustomInput
                      type="number"
                      value={filters[filter.id || ""] || ""}
                      placeholder={"Inserisci..."}
                      onChange={(e: any) =>
                        handleFilter(filter.id || "", e.target.value, filter?.type)
                      }
                      disabled={isLoadingOptions}
                      integer={
                        filter.id === "proposalNumber" ||
                        filter.id === "transactionId"
                      }
                    />
                  ) : filter?.type ===
                    AdvancedSearchPanelModelTypes.ASYNC_SELECT ? (
                    <div className={"position-relative"}>
                      <CustomAsyncSelect
                        onChange={(value: any) =>
                          handleFilter(filter.id || "", value)
                        }
                        onInputChange={(input: string) => onAsyncInputChange(input)}
                        selected={
                          filters && filters[filter.id || ""] && filter.isMultiselect
                            ? filters[filter.id || ""]
                            : filters && filters[filter.id || ""]
                              ? filters[filter.id || ""]
                              : null
                        }
                        options={filter.options}
                        placeholder={filter.placeholder || "Seleziona..."}
                        isMulti={filter.isMultiselect}
                        disabled={filter?.disabled || isLoadingOptions}
                        addStyles={selectStyle}
                        isClearable
                        isGetValueActive
                        noOptionsMessage={
                          isAsyncSelectPristine && filter.secondaryPlaceholder
                            ? filter.secondaryPlaceholder
                            : "Nessun risultato"
                        }
                      />
                      {filter?.loading && (
                        <div className="advancedSearchPanel__selectSpinner">
                          <Loader.Wrapper>
                            <Loader.Spinner className="small" />
                          </Loader.Wrapper>
                        </div>
                      )}
                    </div>
                  ) : filter?.type === AdvancedSearchPanelModelTypes.GROUPED ? (
                    <div className={"position-relative"}>
                      <CustomSelect2
                        placeholder="Seleziona..."
                        onChange={(value: any) => {
                          handleFilter(filter?.id || "", value, filter?.type);
                        }}
                        selected={
                          filters &&
                          filters[filter?.id || ""] &&
                          filter?.isMultiselect
                            ? filters[filter?.id || ""]
                            : filters && filters[filter?.id || ""]
                              ? filters[filter?.id || ""]
                              : null
                        }
                        options={filter?.options}
                        isMulti={filter?.isMultiselect}
                        disabled={filter?.disabled || isLoadingOptions}
                        addStyles={selectStyle}
                        isClearable
                        isGetValueActive
                        formatGroupLabel={filter?.formatGroupLabel}
                        hasGroupedOptions
                      />
                      {filter?.loading && (
                        <div className="advancedSearchPanel__selectSpinner">
                          <Loader.Wrapper>
                            <Loader.Spinner className="small" />
                          </Loader.Wrapper>
                        </div>
                      )}{" "}
                    </div>
                  ) : filter?.type ===
                    AdvancedSearchPanelModelTypes.DOUBLE_INPUT ? (
                    <div className={"position-relative"}>
                      <SearchBarByFilters
                        showCOIwarning={true}
                        searchParams={
                          filters["name"] || filters["surname"]
                            ? {
                                name: filters["name"],
                                surname: filters["surname"]
                              }
                            : filters["nameOrSurname"]
                              ? { nameOrSurname: filter["nameOrSurname"] }
                              : "RESET"
                        }
                        selectedSearchType={{
                          id: "NAME_SURNAME",
                          name: "Cognome e nome"
                        }}
                        onChange={({ name, surname }: any) =>
                          handleFilter(
                            filter?.ids || [],
                            [name, surname],
                            AdvancedSearchPanelModelTypes.DOUBLE_INPUT
                          )
                        }
                        className={"externalMifid"}
                        disabled={filter?.disabled}
                        hideSearchTypeToggle
                        hideSearchIcon
                      />
                    </div>
                  ) : filter?.type ===
                    AdvancedSearchPanelModelTypes.OPTIONAL_NAME_SURNAME ? (
                    <div className={"position-relative"}>
                      <SearchBarByFilters
                        showCOIwarning={false}
                        searchParams={
                          filters["name"] || filters["surname"]
                            ? {
                                name: filters["name"],
                                surname: filters["surname"]
                              }
                            : "RESET"
                        }
                        selectedSearchType={{
                          id: "NAME_SURNAME",
                          name: "Cognome e nome",
                          optional: true
                        }}
                        onChange={({ name, surname }: any) =>
                          handleFilter(filter?.ids || [], [name, surname])
                        }
                        className={"externalMifid"}
                        disabled={filter?.disabled}
                        hideSearchTypeToggle
                        hideSearchIcon
                      />
                    </div>
                  ) : filter?.type ===
                    AdvancedSearchPanelModelTypes.SELECT_COLUMNS ? (
                    <SelectWithColumns
                      placeholder="Seleziona..."
                      onChange={(value: any) =>
                        handleFilter(
                          filter?.ids || [],
                          [value?.opt1, value?.opt2],
                          filter?.type
                        )
                      }
                      selected={
                        filters && filters[filter.id || ""]
                          ? filters[filter.id || ""]
                          : null
                      }
                      colOptions={filter?.colOptions}
                      colLabels={filter?.colLabels}
                      disabled={filter?.disabled}
                      expirationType={filter?.expirationType}
                      checkDisabledValues={filter?.checkDisabledValues}
                      icon={filter.icon}
                    />
                  ) : (
                    <div className={"position-relative "}>
                      <CustomSelect2
                        placeholder={
                          filter?.placeholder || "Inserisci un campo..."
                        }
                        onChange={(value: any) =>
                          handleFilter(filter?.id || "", value)
                        }
                        selected={
                          filters && filters[filter.id || ""] && filter.isMultiselect
                            ? filters[filter.id || ""]
                            : filters && filters[filter.id || ""]
                              ? filters[filter.id || ""]
                              : null
                        }
                        options={filter?.options}
                        isMulti={filter?.isMultiselect}
                        disabled={filter?.disabled || isLoadingOptions}
                        addStyles={
                          limitDropDownHeight ? selectStyleLimited : selectStyle
                        }
                        isSearchable={filter?.isSearchable}
                        onClick={
                          filter?.onClick &&
                          typeof filter?.onClick === "function"
                            ? filter?.onClick
                            : null
                        }
                        isClearable
                        isGetValueActive
                      />

                      {filter?.loading && (
                        <div className="advancedSearchPanel__selectSpinner">
                          <Loader.Wrapper>
                            <Loader.Spinner className="small" />
                          </Loader.Wrapper>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null
            )}
      </div>
      {warningInfo && (
        <div className={"advancedSearchPanel__warningInfo"}>
          <img
            src={InfoIcon}
            alt=""
            style={{
              marginRight: 7,
              height: 37,
              width: 37
            }}
          />
          {warningInfo}
        </div>
      )}
      <div className="AdvancedSearchPanel__footer">
        {isLoadingOptions && (
          <Loader.WidgetWrapper>
            <Loader.Spinner />
          </Loader.WidgetWrapper>
        )}
        <div>
          <Button
            name="Svuota Filtri"
            fontIcon="icon-delete"
            size="regular-icon"
            onClick={handleReset}
            disabled={isLoadingOptions}
          />
        </div>
        <div>
          {!hideCloseButton && (
            <Button name="Chiudi" size="regular" center onClick={onClose} />
          )}
          {secondaryButton}
          <Button
            name="Applica"
            size="regular"
            primary
            center
            disabled={
              !isFiltersChanged || isLoadingOptions || disableApplyButton
            }
            onClick={handleApply}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;
