/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, Fragment, useCallback, useEffect, useState } from "react";
import { Container, Nav, Navbar, Row } from "react-bootstrap";
import logo from "assets/BCC-logo.png";
import Button from "components/Button";
import ModalContainer, {
  ModalSize
} from "components/ModalContainer/ModalContainer";
import { PATH } from "model/common";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { history } from "store/store";
import NavToggleIcon from "assets/icon/22/burgermenu.svg";
import { checkGrants, GrantTypes } from "components/GrantsCheck";
import NotificationsSection from "components/NotificationsSection/NotificationsSection";
import {
  fetchReleaseNotifications,
  fetchReleaseNotificationsUnreadCount,
  patchReleaseNotifications
} from "store/notifications/notifications.service";
import { withHandleHeaderPosition } from "../../../../hoc/withHandleHeaderPosition";
import {
  logoutAction,
  setNotificationsAction,
  setNotificationsFetchedAction,
  setUnreadNotificationsCountAction,
  setUnreadNotificationsCountFetchedAction
} from "../../../../store/currentProfile/current-profile.actions";
import { openUrl } from "tools/common";
import { isEmpty } from "lodash";
import { superAbiCheck } from "tools/profile";
import "./Header.scss";

interface IProps {
  headerClass?: string;
}

const Header: FC<IProps> = props => {
  const dispatch = useDispatch();
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationSort, setNotificationSort] = useState("date,desc");
  const [notificationLastPage, setNotificationLastPage] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notificationError, setnotificationError] = useState(undefined);
  const [notificationsChanged, setNotificationsChanged] = useState<any[]>([]);
  const breakpoint = useSelector((state: any) => state.responsive.breakpoint);
  const grants = useSelector((state: any) => state.currentProfile.grants);
  const navUrls = useSelector((state: any) => state.currentProfile.navUrls);
  const enabled = useSelector(
    (state: any) => state.currentProfile?.gediStatus?.enabled
  );
  const notificationsFetched = useSelector(
    (state: any) => state.currentProfile.notificationsFetched
  );
  const unreadNotificationsCountFetched = useSelector(
    (state: any) => state.currentProfile.unreadNotificationsCountFetched
  );
  const notifications = useSelector(
    (state: any) => state.currentProfile.notifications
  );
  const notificationUnreadCount = useSelector(
    (state: any) => state.currentProfile.unreadNotificationsCount
  );

  const currentProfile = useSelector((state: any) => state.currentProfile);
  const navOptions = [
    {
      exact: true,
      to: `${PATH.HOME}`,
      label: <FormattedMessage id="nav.home" />
    },
    {
      exact: true,
      to: `${PATH.PORTFOLIO}`,
      label: <FormattedMessage id="nav.portfolio" />
    },
    {
      external: true,
      label: <FormattedMessage id="nav.prospect" />,
      callback: (e: any) => {
        e.preventDefault();
        !isEmpty(navUrls?.["FOCUS_MODELS"]) &&
          openUrl(navUrls["FOCUS_MODELS"] ?? "");
      },
      hide: !currentProfile?.info?.isFocusAllowed
    },
    {
      exact: true,
      to: `${PATH.QUESTIONARIO_EXTERNAL}`,
      label: <FormattedMessage id="nav.mifid" />,
      hide: !checkGrants(grants, GrantTypes.MODIFY_MIFID_QUESTIONNAIRE)
    },
    {
      exact: true,
      to: `${PATH.SBLOCCO_COOLING_OFF}`,
      label: <FormattedMessage id="nav.sbloccoCoolingOff" />,
      hide: !checkGrants(grants, GrantTypes.UNLOCK_COOLING_OFF)
    },
    {
      exact: true,
      to: `${PATH.PRODUCTS}`,
      label: <FormattedMessage id="nav.catalogue" />
    },
    {
      exact: true,
      to: `${PATH.EXTRACTIONS}`,
      label: <FormattedMessage id="nav.extractions" />,
      hide: !checkGrants(grants, GrantTypes.EXTRACTIONS_TAB)
    },
    {
      exact: true,
      to: `${PATH.CRUSCOTTO}`,
      label: <FormattedMessage id="nav.cruscotto" />,
      hide: !superAbiCheck(currentProfile.visibility)
    },
    {
      external: true,
      label: <FormattedMessage id="WMP.info" />,
      callback: (e: any) => {
        e.preventDefault();
        !isEmpty(navUrls?.["WMP_INFO"]) && openUrl(navUrls["WMP_INFO"]);
      },
      hide: !navUrls?.["WMP_INFO"]
    },
    {
      exact: true,
      to: `${PATH.DASHBOARD}`,
      label: <FormattedMessage id="nav.dashboard" />,
      style: { marginLeft: "auto" },
      hide: !checkGrants(grants, GrantTypes.FORCING_PTF_MODEL)
    },
    {
      external: true,
      label: <FormattedMessage id="nav.guarantees" />,
      callback: (e: any) => {
        e.preventDefault();
        !isEmpty(navUrls?.["GUARANTEES"]) && openUrl(navUrls["GUARANTEES"]);
      },
      hide: !checkGrants(grants, GrantTypes.GUARANTEES)
    },
    {
      external: true,
      label: <FormattedMessage id="nav.vision" />,
      callback: (e: any) => {
        e.preventDefault();
        !isEmpty(navUrls?.["VISION"]) && openUrl(navUrls["VISION"] ?? "");
      },
      hide: !currentProfile?.info?.isVisionAllowed || !navUrls?.["VISION"]
    },
    {
      external: true,
      label: <FormattedMessage id="nav.investiperGP" />,
      callback: (e: any) => {
        e.preventDefault();
        !isEmpty(navUrls?.["INVESTIPER_GP"]) &&
          openUrl(navUrls["INVESTIPER_GP"]);
      },
      hide: !navUrls?.["INVESTIPER_GP"]
    },
    {
      exact: true,
      to: `${PATH.PROFILE}`,
      label: <FormattedMessage id="nav.profile" />,
      style: { marginLeft: "auto" },
      hide: !enabled
    },
    {
      exact: true,
      to: `${PATH.LOGOUT}`,
      label: <FormattedMessage id="nav.logout" />,
      style: { marginLeft: "auto" },
      callback: () => dispatch(logoutAction()),
      hide: enabled
    }
  ];

  useEffect(() => {
    if (!isEmpty(currentProfile)) {
      if (currentProfile.token) {
        if (!notificationsFetched) {
          doFetchNotifications(notificationPage, notificationSort);
          dispatch(setNotificationsFetchedAction());
        }
        if (!unreadNotificationsCountFetched) {
          doFetchUnreadNotificationCount();
          dispatch(setUnreadNotificationsCountFetchedAction());
        }
      }
    }
  }, [notificationsFetched, unreadNotificationsCountFetched]);

  const handleUpdateNotifications = React.useCallback(
    (updated: any, notificationId: any) => {
      const newChanged = [...notificationsChanged];
      newChanged.push(notificationId);
      dispatch(setNotificationsAction(updated));
      setNotificationsChanged(newChanged);
    },
    [notificationsChanged, notifications]
  );

  const handleSubmitNotifications = React.useCallback(() => {
    if (notificationsChanged.length > 0)
      patchReleaseNotifications({
        ids: notificationsChanged
      })
        .then(() => {
          dispatch(
            setUnreadNotificationsCountAction(
              notificationUnreadCount - notificationsChanged.length
            )
          );
          setNotificationsChanged([]);
        })
        .catch(() => null);
  }, [notificationsChanged, notificationUnreadCount]);

  const handleFetchMoreNotifications = useCallback(() => {
    const nextPage = notificationPage + 1;
    setNotificationPage(nextPage);
    doFetchNotifications(nextPage, notificationSort);
  }, [notifications, notificationPage, notificationLastPage, notificationSort]);

  const handleResetNotifications = useCallback(() => {
    if (false) {
      dispatch(setNotificationsAction(notifications.slice(0, 5)));
      setNotificationPage(0);
      setNotificationLastPage(false);
    }
  }, [notifications, notificationPage, notificationLastPage, notificationSort]);

  const doFetchNotifications = (
    page?: number,
    sort?: string,
    concat = true,
    size: number = 5
  ) => {
    setNotificationLoading(true);
    fetchReleaseNotifications({ page, sort, size })
      .then(({ content = [], last }: any = {}) => {
        if (concat) {
          const prevNotifications = [...notifications];
          dispatch(setNotificationsAction(prevNotifications.concat(content)));
        } else {
          dispatch(setNotificationsAction(content));
        }
        setNotificationLastPage(last);
      })
      .catch((e: any) => setnotificationError(e))
      .finally(() => setNotificationLoading(false));
  };

  const doFetchUnreadNotificationCount = () => {
    fetchReleaseNotificationsUnreadCount()
      .then((count: any) => {
        dispatch(setUnreadNotificationsCountAction(count));
      })
      .catch((e: any) => setnotificationError(e));
  };

  const numVisibleTabs = () => {
    const visibleTabs = navOptions.filter(tab => tab.hide != true);
    return visibleTabs.length;
  };

  const isNumVisibleTabsIsTooHigh = numVisibleTabs() > 8;

  return (
    <Fragment>
      <div className={`Header-container ${props.headerClass}`}>
        <div className="Header__wrapper">
          <div
            className={
              isNumVisibleTabsIsTooHigh
                ? "alternative-header-wrapperContainer"
                : "Header__wrapperContainer"
            }
          >
            <div className={"Header"}>
              <React.Fragment>
                <Navbar
                  className={"Header__WmpNavbar"}
                  expand="lg"
                  expanded={expanded}
                >
                  {breakpoint == "tabletLg" ||
                  breakpoint == "tabletSm" ||
                  breakpoint == "mobile" ? (
                    <Button
                      name="mainNav toggle"
                      className="header__mainNavToggle"
                      size="icon-md"
                      onClick={() => setExpanded(!expanded)}
                      tertiary
                      svgIcon={<img src={NavToggleIcon} alt="" />}
                    />
                  ) : null}
                  <Navbar.Brand>
                    <Row
                      className={"clickable"}
                      onClick={() => {
                        history.push(PATH.HOME);
                      }}
                    >
                      <img
                        src={logo}
                        alt=""
                        width={95}
                        height={32}
                        className={"Header__logo"}
                      />
                      <div className={"Header__Line"} />
                      <h3 className={"Header__logoText"}>
                        Wealth
                        <br />
                        Management
                        <br />
                        Platform
                      </h3>
                    </Row>
                  </Navbar.Brand>
                  <Navbar.Collapse>
                    <Nav className={`Header__navbarBlock w-100`}>
                      {breakpoint == "tabletLg" ||
                      breakpoint == "tabletSm" ||
                      breakpoint == "mobile" ? (
                        <ModalContainer
                          show={expanded}
                          onHide={() => setExpanded(false)}
                          modalSize={ModalSize.SIDEBAR}
                          animation={false}
                        >
                          <Container>
                            <Row>
                              <Button
                                name="closeNav"
                                tertiary
                                size={"icon-md"}
                                className={"HeaderNavbar_closeBtn"}
                                fontIcon="icon-close-small"
                                onClick={() => setExpanded(false)}
                              />
                              <Row
                                className={"clickable"}
                                onClick={() => {
                                  history.push(PATH.HOME);
                                }}
                              >
                                <img
                                  src={logo}
                                  alt=""
                                  width={95}
                                  height={32}
                                  className={"Header__logo"}
                                />
                                <div className={"Header__Line"} />
                                <h3 className={"Header__logoText"}>
                                  Wealth
                                  <br />
                                  Management
                                  <br />
                                  Platform
                                </h3>
                              </Row>
                            </Row>
                            {navOptions.map(
                              (option, i) =>
                                !option?.hide && (
                                  <NavLink
                                    key={`NavLink_${i}`}
                                    exact={option.exact}
                                    to={option?.external ? "#" : option.to}
                                    target={option?.external ? "blank" : ""}
                                    className={`${
                                      isNumVisibleTabsIsTooHigh
                                        ? "alternative-header-link-padding"
                                        : "classic-header-link-padding"
                                    } Header__link`}
                                    activeClassName={
                                      !option?.external
                                        ? "Header__linkSelected"
                                        : ""
                                    }
                                    onClick={(e: any) => {
                                      if (expanded) setExpanded(false);
                                      if (
                                        typeof option?.callback === "function"
                                      )
                                        option.callback(e);
                                    }}
                                  >
                                    {option.label}
                                  </NavLink>
                                )
                            )}
                          </Container>
                        </ModalContainer>
                      ) : (
                        navOptions.map(
                          (option, i) =>
                            !option?.hide && (
                              <NavLink
                                key={`NavLink_${i}`}
                                exact={option.exact}
                                to={option?.external ? "#" : option.to}
                                target={option?.external ? "blank" : ""}
                                className={`${
                                  isNumVisibleTabsIsTooHigh
                                    ? "alternative-header-link-padding"
                                    : "classic-header-link-padding"
                                } Header__link`}
                                activeClassName={
                                  !option?.external
                                    ? "Header__linkSelected"
                                    : ""
                                }
                                onClick={(e: any) => {
                                  if (expanded) setExpanded(false);
                                  if (typeof option?.callback === "function")
                                    option.callback(e);
                                }}
                              >
                                {option.label}
                              </NavLink>
                            )
                        )
                      )}
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
                <NotificationsSection
                  notifications={notifications}
                  unreadCount={notificationUnreadCount}
                  setNotifications={handleUpdateNotifications}
                  onClose={() => {
                    handleSubmitNotifications();
                    handleResetNotifications();
                  }}
                  onFetchMore={handleFetchMoreNotifications}
                  onReset={handleResetNotifications}
                  lastPage={notificationLastPage}
                  loading={notificationLoading}
                  error={notificationError}
                />
              </React.Fragment>
            </div>
          </div>
        </div>
      </div>
      <div className={`Header__spacer ${props.headerClass}`} />
    </Fragment>
  );
};

export default withHandleHeaderPosition(Header);
