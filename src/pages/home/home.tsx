import { CurrentDate } from "components/CurrentDate/CurrentDate";
import { checkGrants, GrantTypes } from "components/GrantsCheck";
import InfoAlert from "components/InfoAlert";
import InfoAlertSection from "components/InfoAlertSection/InfoAlertSection";
import OverviewSectionWrapper from "components/OverviewSectionWrapper";
import ProposalsTable from "components/ProposalsTable/ProposalsTable";
import SearchBar from "components/SearchBar";
import WidgetCustomerProspectList from "components/widget/WidgetCustomerProspectList/WidgetCustomerProspectList";
import withExternalClickManaged from "hoc/withExternalClickManagement";
import * as React from "react";
import { FC, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { isEmpty } from "lodash";
import { FormattedDate } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderAlertsMonitoringAction,
  setApproveAmlErrorAction,
  setExternalConsultancyErrorAction,
  setNotesErrorAction
} from "store/home/home.actions";
import { history } from "store/store";
import messagesID from "../../localization/index";
import { toggleOrdersInProgressForCustomer } from "../../store/customer/customer.actions";
import { fetchDisclaimerForMerging } from "store/home/home.service";
import { IDisclaimerDTO, configDisclaimers } from "model/disclaimers";
import AlertSection from "./AlertSection";
import { proposalStatus } from "model/proposal";
import { fetchProposalStatuses } from "store/proposal/proposal.service";
import { homePageLoadedAction } from "store/currentProfile/current-profile.actions";
import "./home.scss";

const ComponentWithExternalClickManagement =
  withExternalClickManaged(ProposalsTable);

export const HomePage: FC = () => {
  const [activeFilters, setActiveFilters] = useState({});

  const dispatch = useDispatch();
  const [inputSearch, setInputSearch] = useState("");
  const [showOrderAlertsMonitoringError, setShowOrderAlertsMonitoringError] =
    useState(false);
  const [showBankMergingAlert, setShowBankMergingAlert] =
    useState<IDisclaimerDTO>({
      text: "",
      show: false,
      toBeMantained: false
    });
  const [showFinCADAlert, setShowFinCADAlert] = useState<IDisclaimerDTO>({
    text: "",
    show: false,
    toBeMantained: false
  });
  const lastProposalsRef = React.useRef<any>(null);
  const [showProposalsTable, setShowProposalsTable] = useState(true);
  const [proposalStatuses, setProposalStatuses] = useState({
    loading: true,
    list: []
  });
  const [showTransactionsTable, setShowTransactionsTable] = useState(false);
  const [showRemoteProposalsTable, setShowRemoteProposalsTable] =
    useState(false);
  const setDisclaimerMap = {
    FUSIONE: setShowBankMergingAlert,
    CESSIONE: setShowBankMergingAlert,
    CAD_TRANSITION: setShowFinCADAlert
  };
  const [linkError, setLinkError] = useState(false);

  const currentProfile = useSelector((state: any) => state.currentProfile.info);
  const grants = useSelector((state: any) => state.currentProfile.grants);
  const approveAmlError = useSelector(
    (state: any) => state.home.approveAmlError
  );
  const updateNotesError = useSelector(
    (state: any) => state.currentProfile.updateNotesError
  );
  const externalconsultancyError = useSelector(
    (state: any) => state.home.externalConsultancyError
  );
  const orderAlertsMonitoring = useSelector(
    (state: any) => state.home.orderAlertsMonitoring
  );
  const ordersInProgressCheck = useSelector(
    (state: any) => state.customer.ordersInProgressCheck
  );
  const homePageLoaded = useSelector(
    (state: any) => state.currentProfile.homePageLoaded
  );

  React.useEffect(() => {
    if (
      orderAlertsMonitoring?.openOrdersTab &&
      orderAlertsMonitoring?.activeFilters &&
      lastProposalsRef.current
    ) {
      const { offsetTop } = lastProposalsRef.current;
      window.scrollTo(0, offsetTop - 100);
      setShowProposalsTable(false);
      setShowTransactionsTable(true);
      setShowRemoteProposalsTable(false);
    }
  }, [orderAlertsMonitoring?.openOrdersTab, lastProposalsRef]);

  React.useEffect(() => {
    if (orderAlertsMonitoring?.error) {
      setShowOrderAlertsMonitoringError(true);
    }
  }, [orderAlertsMonitoring?.error]);

  React.useEffect(() => {
    if (
      orderAlertsMonitoring?.openProposalsTab &&
      orderAlertsMonitoring?.activeFiltersForProposals &&
      lastProposalsRef.current
    ) {
      const { offsetTop } = lastProposalsRef.current;
      window.scrollTo(0, offsetTop - 100);
      setShowProposalsTable(true);
      setShowTransactionsTable(false);
      setShowRemoteProposalsTable(false);
    }
  }, [orderAlertsMonitoring?.openProposalsTab, lastProposalsRef]);

  React.useEffect(() => {
    if (homePageLoaded) {
      dispatch(fetchOrderAlertsMonitoringAction());
      dispatch(homePageLoadedAction());

      fetchDisclaimerForMerging().then((res: any) => {
        if (res && !isEmpty(res)) {
          const disclaimersObj = configDisclaimers(res, setDisclaimerMap, true);
          Object.values(disclaimersObj).forEach((disclaimer: any) => {
            if (typeof disclaimer.setDisclaimer === "function") {
              disclaimer.setDisclaimer(disclaimer.disclaimerList);
            }
          });
        }
      });

      fetchProposalStatuses()
        .then(statuses =>
          setProposalStatuses({
            loading: false,
            list: statuses.filter(
              (statuses: any) =>
                statuses.proposalStatus !== proposalStatus.EXECUTED_PARTIALLY
            )
          })
        )
        .catch(() => setProposalStatuses({ loading: false, list: [] }));
    }
  }, [dispatch, homePageLoaded]);

  React.useEffect(() => {
    if (orderAlertsMonitoring?.openOrdersTab && !showTransactionsTable) {
      setShowProposalsTable(false);
      setShowTransactionsTable(true);
      setShowRemoteProposalsTable(false);
    }
  }, [orderAlertsMonitoring?.openOrdersTab, showTransactionsTable]);

  const handleSubmit = () => {
    history.push({
      pathname: "/portfolio",
      search: `?search=${inputSearch}`
    });
  };

  return (
    <div className="homePage__wrapper">
      <InfoAlertSection adjustScrollY>
        <InfoAlert
          hasAutoHide={false}
          showInfo={ordersInProgressCheck}
          closeInfo={() => dispatch(toggleOrdersInProgressForCustomer(false))}
          typeClassName="WARNING"
          displayAsBlock
        >
          Su questo dossier sono presenti ordini in corso di esecuzione.
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={showOrderAlertsMonitoringError}
          closeInfo={() => setShowOrderAlertsMonitoringError(false)}
          typeClassName="ERROR"
          displayAsBlock
        >
          Impossibile completare l&apos;operazione.
        </InfoAlert>
        <InfoAlert
          hasAutoHide={true}
          showInfo={linkError}
          closeInfo={() => setLinkError(false)}
          typeClassName="ERROR"
          displayAsBlock
        >
          Impossibile completare l&apos;operazione.
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={!!approveAmlError}
          closeInfo={() => dispatch(setApproveAmlErrorAction(undefined))}
          typeClassName={approveAmlError?.type}
          displayAsBlock
        >
          {approveAmlError?.message}
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={!!externalconsultancyError}
          closeInfo={() =>
            dispatch(setExternalConsultancyErrorAction(undefined))
          }
          typeClassName={externalconsultancyError?.type}
          displayAsBlock
        >
          {externalconsultancyError?.message}
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={!!updateNotesError}
          closeInfo={() => setNotesErrorAction(undefined)}
          typeClassName={updateNotesError?.type}
          displayAsBlock
        >
          {updateNotesError?.message}
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={showBankMergingAlert?.show}
          typeClassName="WARNING"
          displayAsBlock
          closeInfo={() => setShowBankMergingAlert(undefined as any)}
        >
          {showBankMergingAlert?.text}
        </InfoAlert>
        <InfoAlert
          hasAutoHide={false}
          showInfo={showFinCADAlert?.show}
          typeClassName="WARNING"
          displayAsBlock
          closeInfo={() => setShowFinCADAlert(undefined as any)}
        >
          {showFinCADAlert?.text}
        </InfoAlert>
      </InfoAlertSection>
      <OverviewSectionWrapper>
        <Container>
          <Row>
            <Col xs={6}>
              <CurrentDate
                meteo={`SUN`}
                hideMeteo
                date={
                  <FormattedDate
                    value={new Date()}
                    weekday="long"
                    day="numeric"
                    year="numeric"
                    month="long"
                  />
                }
              />
            </Col>
            <Col xs={6}>
              <div className={"text-right mb-4"}>
                {currentProfile?.bankDescription} <br />
                {currentProfile?.branchDescription}
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <SearchBar
                placeholder={messagesID["home.searchBar.placeholder"]}
                handleSubmit={handleSubmit}
                inputSearch={inputSearch}
                handleInputSearch={setInputSearch}
              />
            </Col>
          </Row>
          <AlertSection />
        </Container>
      </OverviewSectionWrapper>
      {checkGrants(grants, GrantTypes.MANUAL_ONBOARDING) && (
        <Container>
          <WidgetCustomerProspectList />
        </Container>
      )}
      {showProposalsTable && !proposalStatuses?.loading && (
        <ProposalsTable
          showProposalsTable={showProposalsTable}
          setShowProposalsTable={setShowProposalsTable}
          showTransactionsTable={showTransactionsTable}
          setShowTransactionsTable={setShowTransactionsTable}
          showRemoteProposalsTable={showRemoteProposalsTable}
          setShowRemoteProposalsTable={setShowRemoteProposalsTable}
          lastProposalsRef={lastProposalsRef}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          proposalStatuses={proposalStatuses}
          setLinkError={setLinkError}
        />
      )}
    </div>
  );
};
