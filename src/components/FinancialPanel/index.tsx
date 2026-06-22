import React, { FC, ReactElement, ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import InfoIcon from "../../assets/icon/notification/info.svg";
import Edit from "../../assets/icon/22/edit.svg";
import { GrantsCheck, GrantTypes } from "components/GrantsCheck";
import { TooltipWrapper } from "components/ProposalNumberTooltip/ProposalNumberTooltip";
import { PATH } from "model/common";
import { history } from "store/store";
import "./FinancialPanel.scss";

interface IProps {
  customerId?: number;
  isCustomerPage?: boolean;
  title?: string | ReactElement;
  children?: ReactNode;
  style?: any;
  className?: string;
  titleClassName?: string;
  isTitleTooltip?: Boolean;
  styleForSupervisorCard?: any;
  disclaimer?: ReactNode;
}

const FinancialPanel: FC<IProps> = ({
  title,
  isCustomerPage,
  styleForSupervisorCard,
  customerId,
  children,
  style = {},
  className = "",
  titleClassName,
  isTitleTooltip,
  disclaimer
}) => {
  const divStyleSituazione = {
    display: "flex",
    alignItems: "center",
    ...(title === "Situazione Patrimoniale"
      ? { justifyContent: "space-between" }
      : {})
  };

  return (
    <div style={style} className="financialPanel__container">
      {title && (
        <div style={divStyleSituazione}>
          <PanelTitle title={title} className={titleClassName} />
          {isCustomerPage && title === "Situazione Patrimoniale" && (
            <GrantsCheck allowedGrant={GrantTypes.MODIFY_CUSTOMER}>
              <div
                className="needsAnalysisHeader clickable"
                onClick={() =>
                  history.push(
                    `${(PATH as any).ADVANCED_CONSULTANCY_PROPOSAL}/modify/${customerId}/needsAnalysis`
                  )
                }
              >
                <PanelTitle title="Analisi dei bisogni" />
                <img
                  src={Edit}
                  alt=""
                  className="SurveyCard__edit__icon ml-3 mb-2"
                />
              </div>
            </GrantsCheck>
          )}
          {isTitleTooltip ? (
            <TooltipWrapper
              tooltipContent={
                <FormattedMessage id="common.label.situazioneReddituale.description" />
              }
              showIcon={true}
            />
          ) : null}
        </div>
      )}
      {disclaimer && (
        <div className="mb-4">
          <img
            src={InfoIcon}
            alt=""
            style={{
              marginRight: 7,
              height: 16
            }}
          />
          {disclaimer}
        </div>
      )}
      <div
        style={styleForSupervisorCard}
        className={`financialPanel__content ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export const PanelTitle: any = ({ title, className = "" }) => (
  <h5 className={`financialPanel__title ${className}`}>{title}</h5>
);

export default FinancialPanel;
