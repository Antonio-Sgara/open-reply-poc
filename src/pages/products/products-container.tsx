import React, { FC, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { fetchAlertsAction } from "store/alert/alert.actions";
import { ProductsPage } from "./products";
import { connect } from "react-redux";

interface IProps {
  alerts: any;
  fetchAlerts: () => any;
}

const ProductsPageContainerInner: FC<IProps & RouteComponentProps<any>> = props => {
  useEffect(() => {}, []);

  return <ProductsPage {...props} />;
};

function mapStateToProps(state: any) {
  return {
    alerts: state.alerts.data
  };
}

function mapDispatchToProps(dispatch: any) {
  return {
    fetchAlerts: (param: any) => dispatch(fetchAlertsAction(param))
  };
}

export const ProductsPageContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProductsPageContainerInner)
);
