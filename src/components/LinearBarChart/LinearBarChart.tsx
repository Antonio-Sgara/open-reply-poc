import React, { FC, ReactNode } from "react";
import InlineBlock from "../InlineBlock";
import { filterByPercentage } from "./linearBarChart-utils";
import { FormattedMessage } from "react-intl";
import { percFormatter } from "components/utils";
import "./linearBarChart.scss";

export interface linearBarChartElement {
  name?: string | ReactNode;
  color: string;
  percentage?: number;
  border?: string;
  subLinePercentage?: number;
  id?: string;
  value?: number;
}

interface IProps {
  title?: ReactNode;
  value?: number | string | React.ReactElement;
  elements: Array<linearBarChartElement>;
  className?: string;
  backgroundLinearColor?: string;
  hideLegend?: boolean;
  hideTitle?: boolean;
}

const roundToTwoDecimal = (value?: number) =>
  Number(Number(value ?? 0).toFixed(2));

const LinearBarChart: FC<IProps> = ({
  title,
  value,
  className = "",
  elements = [],
  backgroundLinearColor,
  hideLegend,
  hideTitle = false
}) => {
  return (
    <div className={`linearBarChart ${className}`}>
      <div className="linearBarChart__header">
        <div>
          {title && !hideTitle && (
            <span className="linearBarChart__title">{title}</span>
          )}
          {value && <span className="linearBarChart__value">{value}</span>}
        </div>
        {hideLegend || (
          <div className="linearBarChart__legend">
            <div>
              {elements.map((el, index) => (
                <div key={index} className="linearBarChart__graphElement">
                  <InlineBlock
                    style={{ backgroundColor: el.color, border: el.border }}
                    className="linearBarChart__pill"
                  />
                  {typeof el.name !== "string" ? (
                    el.name
                  ) : (
                    <FormattedMessage id={el.name as string} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="linearBarChart__graphLinear__container">
        <div
          style={{ backgroundColor: backgroundLinearColor }}
          className="linearBarChart__graphLinear with--shadow"
        >
          {filterByPercentage(elements).map((el, index) => (
            <InlineBlock
              key={index}
              className={`linearBarChart__graphLinearBlock ${
                el.percentage > 0 ? "minWidthLinearBarchart" : ""
              }`}
              style={{
                width: `${roundToTwoDecimal(el.percentage)}%`,
                backgroundColor: el.color,
                border: el.border
              }}
            />
          ))}
        </div>
      </div>
      <div className="linearBarChart__summary">
        {filterByPercentage(elements).map((el, index) => (
          <span key={index}>
            {typeof el.name === "string" ? <FormattedMessage id={el.name} /> : el.name}:{" "}
            {percFormatter(el.percentage)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LinearBarChart;
