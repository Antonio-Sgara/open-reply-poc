import React from "react";

interface ColumnDef {
  Header?: React.ComponentType<any> | (() => React.ReactNode) | React.ReactNode;
  id?: string;
  accessor?: ((row: any) => React.ReactNode) | string;
  width?: number;
  className?: string;
  headerClassName?: string;
}

const renderHeader = (column: ColumnDef, data: any[]) => {
  if (!column.Header) return null;
  if (typeof column.Header === "function") {
    const HeaderComponent = column.Header as any;
    return <HeaderComponent data={data} />;
  }
  return column.Header;
};

const renderCell = (column: ColumnDef, row: any) => {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }
  if (typeof column.accessor === "string") {
    return row?.[column.accessor] ?? null;
  }
  return null;
};

const TableWithFixedColumns = ({
  data = [],
  columns = [],
  className = ""
}: {
  data?: any[];
  columns?: ColumnDef[];
  className?: string;
}) => {
  return (
    <div className={className} style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.id ?? index}
                className={column.headerClassName}
                style={{
                  minWidth: column.width,
                  textAlign: "left",
                  padding: "8px 10px",
                  borderBottom: "1px solid #ddd",
                  background: "#fff",
                  position: "sticky",
                  top: 0
                }}
              >
                {renderHeader(column, data)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.productId ?? row.isin ?? rowIndex}>
              {columns.map((column, columnIndex) => (
                <td
                  key={`${column.id ?? columnIndex}-${row.productId ?? rowIndex}`}
                  className={column.className}
                  style={{
                    minWidth: column.width,
                    padding: "8px 10px",
                    borderBottom: "1px solid #eee",
                    verticalAlign: "top"
                  }}
                >
                  {renderCell(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWithFixedColumns;
