import React, { FC, ReactNode } from "react";
import "./FinancialTable.scss";

interface IProps {
  columns: ReactNode;
  children: ReactNode;
  style?: object;
}

const FinancialTable: FC<IProps> = ({ columns, children, style = {} }) => {
  return (
    <div style={style}>
      <div className="financialTable__table" style={{ marginBottom: 10 }}>
        <div className="financialTable__tableRow">{columns}</div>
      </div>
      {children}
    </div>
  );
};

interface IPropsTableCell {
  children: any;
  style?: any;
  className?: string;
  onClick?: () => void;
}

export const TableCell: FC<IPropsTableCell> = ({
  children,
  style,
  className = "",
  onClick
}) => (
  <div
    className={`financialTable__tableCell ${className}`}
    style={style}
    onClick={onClick}
  >
    {children}
  </div>
);

export default FinancialTable;
