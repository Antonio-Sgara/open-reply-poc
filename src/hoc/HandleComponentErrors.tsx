import React from "react";
import Loader from "components/Loader/Loader";
import { FormattedMessage } from "react-intl";

interface IProps {
  showError: boolean;
  loading?: boolean;
  loaderClassName?: string;
  errorMsgClassName?: string;
  errorMsg?: any;
  children: any;
}

export const HandleComponentErrors: React.FC<IProps> = ({
  errorMsgClassName = "text-center",
  errorMsg = <FormattedMessage id="api.requestFailed" />,
  ...props
}) => {
  if (props.loading) {
    return (
      <div className={`${props.loaderClassName}`}>
        <Loader.WidgetWrapper>
          <Loader.Spinner />
        </Loader.WidgetWrapper>
      </div>
    );
  }

  return !props.showError ? (
    props.children
  ) : (
    <div className={`${errorMsgClassName}`}> {errorMsg}</div>
  );
};
