import Title from "components/Title/Title";
import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface SimpleTableHeaderProps {
  title: ReactNode;
  numberOfElements?: number;
  description?: string;
}

const SimpleTableHeader: React.FC<SimpleTableHeaderProps> = ({
  title,
  numberOfElements,
  description
}) => {
  return (
    <>
      <Title.Widget>
        {title}

        {numberOfElements ? (
          <span className="simpleTableTitle__numberOfElements">
            ({numberOfElements} totali){" "}
          </span>
        ) : numberOfElements === undefined ? (
          ""
        ) : (
          "(0)"
        )}
      </Title.Widget>
      {description && (
        <div className="SimpleTable_description">
          <FormattedMessage id={description} defaultMessage={"- -"} />
        </div>
      )}
    </>
  );
};

export default SimpleTableHeader;
