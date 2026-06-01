import { Button } from "components/Button/Button";
import React, { FC, ReactNode } from "react";
import { Row, Col, Accordion } from "react-bootstrap";
import SimpleTableHeader from "./simpleTableHeader";
import "./SimpleTable.scss";

interface IProps {
  children?: any;
  style?: any;
  title?: ReactNode;
  description?: string;
  titleClassName?: string;
  numberOfElements?: number;
  lateralButtons?: any;
  className?: string;
  scalarDisplay?: boolean;
  simpleTableStyle?: object;
  withAdvancedSearch?: boolean;
  advancedSearchBar?: ReactNode;
  searchBarToggle?: ReactNode;
  innerTableStyle?: object;
  buttonAction?: () => void;
}

const SimpleTable: FC<IProps> = ({
  children,
  title,
  description,
  numberOfElements,
  lateralButtons,
  className,
  titleClassName = "",
  scalarDisplay,
  simpleTableStyle = {},
  withAdvancedSearch = false,
  advancedSearchBar,
  searchBarToggle,
  innerTableStyle = {},
  buttonAction
}) => {
  return (
    <div
      className={`SimpleTable__wrapper ${className || ""}`}
      style={simpleTableStyle}
    >
      {title && (
        <div className={`SimpleTable__title ${titleClassName}`}>
          {withAdvancedSearch && advancedSearchBar && searchBarToggle ? (
            <Accordion defaultActiveKey="0">
              <Row>
                <Col>
                  <SimpleTableHeader
                    title={title}
                    numberOfElements={numberOfElements}
                  />
                  {searchBarToggle}
                </Col>
                <Col xs={6}>
                  <div className={"float-right"}>
                    <Button
                      secondary
                      onClick={buttonAction}
                      name={"Estrai alert"}
                    />
                  </div>
                </Col>
              </Row>
              {advancedSearchBar}
            </Accordion>
          ) : (
            <Row>
              <Col xs={lateralButtons ? 6 : 12}>
                <SimpleTableHeader
                  title={title}
                  numberOfElements={numberOfElements}
                  description={description}
                />
              </Col>
              {lateralButtons && <Col xs={6}>{lateralButtons}</Col>}
            </Row>
          )}
        </div>
      )}
      <table
        className={`simpleTable ${scalarDisplay ? "scalar" : ""}`}
        cellSpacing="0"
        cellPadding="0"
        style={innerTableStyle}
      >
        {React.Children.map(children, child =>
          React.isValidElement(child) ? React.cloneElement(child, {}) : child
        )}
      </table>
    </div>
  );
};

export const TrTableRow = ({
  children,
  style = {},
  className = "",
  scalar = false,
  onClick = () => null
}: any) => (
  <tr
    style={style}
    className={`simpleTable__tableRow ${className} ${scalar ? "scalar" : ""}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TrColumnNames = ({
  children,
  style = {},
  className = "",
  scalar = false
}: any) => (
  <tr
    style={style}
    className={`simpleTable__columnNames  ${className} ${
      scalar ? "scalar" : ""
    }`}
  >
    {children}
  </tr>
);

export const SpanTableBadge = ({
  children,
  style = {},
  className = "",
  scalar = false
}: any) => (
  <span
    style={style}
    className={`simpleTable__tableBadge ${className} ${scalar ? "scalar" : ""}`}
  >
    {children}
  </span>
);

export const TdSmall = ({
  children,
  style = {},
  className = "",
  scalar = false
}: any) => (
  <td
    style={style}
    className={`simpleTable__tdSmall ${className} ${scalar ? "scalar" : ""}`}
  >
    {children}
  </td>
);

export const TdMedium = ({
  children,
  style = {},
  className = "",
  scalar = false
}: any) => (
  <td
    style={style}
    className={`simpleTable__tdMedium ${className} ${scalar ? "scalar" : ""}`}
  >
    {children}
  </td>
);

export default SimpleTable;
