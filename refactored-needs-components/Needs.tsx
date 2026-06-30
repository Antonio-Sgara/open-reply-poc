import React, { FC } from "react";
import Loader from "../../../Loader/Loader";
import FinancialPanel from "../../../FinancialPanel";
import NeedsGraphic from "./NeedsGraphic";
import NeedsTable from "./NeedsTable";
import { getFinancialComponentTotal } from "./Needs-calculation-utils";

interface IProps {
  customerId: number;
  financialAssets;
  needs;
  setNeeds?;
  visualOnly;
  style?;
}

const Needs: FC<IProps> = ({
  customerId,
  financialAssets,
  needs,
  setNeeds,
  visualOnly,
  style
}) => {
  const totalFinancialAssets = financialAssets?.ctv;
  const dossierFinancialAssets = getFinancialComponentTotal(
    financialAssets,
    "DOSSIER"
  );

  return (
    <FinancialPanel title={"Bisogni"} style={style ? style : { marginTop: 50 }}>
      {!needs ? (
        <Loader.Wrapper>
          <Loader.Spinner />
        </Loader.Wrapper>
      ) : (
        <>
          <NeedsGraphic
            needs={needs}
            captiveFinancialAssets={totalFinancialAssets}
          />
          <NeedsTable
            captiveFinancialAssets={dossierFinancialAssets}
            financialAssets={financialAssets}
            needs={needs}
            setNeeds={setNeeds}
            visualOnly={visualOnly}
          />
        </>
      )}
    </FinancialPanel>
  );
};

export default Needs;
