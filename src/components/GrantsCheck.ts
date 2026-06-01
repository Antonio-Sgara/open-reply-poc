import { isEmpty } from "lodash";
import { useSelector } from "react-redux";

export enum GrantTypes {
  EXTRACTIONS_TAB = "W0001",
  ADD_CUSTOMER_CTA = "W0002",
  MODIFY_CUSTOMER = "W0003",
  DELETE_CUSTOMER = "W0004",
  MODIFY_MIFID_QUESTIONNAIRE = "W0005",
  // REPORT STANDARD
  DOWNLOAD_REPORT_DIAGNOSIS_DISPOSITIVE = "W0006",
  DOWNLOAD_REPORT_MONITORING_DISPOSITIVE = "W0006",
  DOWNLOAD_REPORT_POSITION_KEEPING_DISPOSITIVE = "W0006",
  DOWNLOAD_REPORT_PROPOSAL_DISPOSITIVE = "W0007",
  DOWNLOAD_REPORT_PROPOSAL_SIMULATION_DISPOSITIVE = "W0007",
  // REPORT SIMULATOR
  DOWNLOAD_REPORT_DIAGNOSIS_SIMULATED = "W0020",
  DOWNLOAD_REPORT_POSITION_KEEPING_SIMULATED = "W0020",
  DOWNLOAD_REPORT_MONITORING_SIMULATED = "W0020",
  DOWNLOAD_REPORT_PROPOSAL_SIMULATED = "W0021",
  DOWNLOAD_REPORT_PROPOSAL_SIMULATION_SIMULATED = "W0021",
  // FREE PROPOSAL STANDARD
  CREATE_FREE_PROPOSAL_DISPOSITIVE = "W0008",
  MODIFY_FREE_PROPOSAL_DISPOSITIVE = "W0009",
  // FREE PROPOSAL SIMULATED
  CREATE_FREE_PROPOSAL_SIMULATED = "W0022",
  MODIFY_FREE_PROPOSAL_SIMULATED = "W0023",

  // GUIDED PROPOSAL
  CREATE_GUIDED_PROPOSAL = "W0010",
  MODIFY_GUIDED_PROPOSAL = "W0011",

  DELETE_PROPOSAL = "W0012",
  FORMADOC = "W0013",
  ISIDOC = "W0014",
  MODIFY_PTF_MODEL = "W0015",
  CREATE_INVESTMENT_PROJECTS = "W0016",
  MODIFY_INVESTMENT_PROJECTS = "W0017",
  DELETE_INVESTMENT_PROJECTS = "W0018",
  FORCING_PTF_MODEL = "W0019",

  //TAB PROVVIGIONI / COMMISSIONI
  COMMISSIONREBATES_VISIBILITY = "W0024",

  //MANCATA RICONCILIAZIONE
  MODIFY_PROPOSAL_STATUS = "W0025",

  // MODULO GARANZIE
  GUARANTEES = "W0026",

  //CUSTOM
  MANUAL_ONBOARDING = "MANUAL_ONBOARDING",

  //SBLOCCO COOLING OFF
  UNLOCK_COOLING_OFF = "W0027"
}

export enum visibilityTypes {
  ABI = "ABI",
  MULTIABI = "MULTI_ABI",
  CAB = "CAB",
  MULTICAB = "MULTI_CAB",
  ALL = "ALL",
  NONE = "NONE"
}

export const checkGrants = (
  userGrants,
  allowedGrant,
  multipleCheckLogic = "AND"
) => {
  return !isEmpty(allowedGrant)
    ? Array.isArray(allowedGrant)
      ? multipleCheckLogic === "AND"
        ? allowedGrant.every(grant => userGrants?.includes(grant)) //ARRAY AND
        : allowedGrant.some(grant => userGrants?.includes(grant)) //ARRAY OR
      : userGrants?.includes(allowedGrant) //STRING
    : false;
};

export const GrantsCheck = ({
  allowedGrant,
  multipleCheckLogic = "AND",
  children = null
}) => {
  const userGrants = useSelector((state: any) => state.currentProfile?.grants);

  const permitted = checkGrants(userGrants, allowedGrant, multipleCheckLogic);

  if (permitted) {
    return children;
  }

  return null;
};
