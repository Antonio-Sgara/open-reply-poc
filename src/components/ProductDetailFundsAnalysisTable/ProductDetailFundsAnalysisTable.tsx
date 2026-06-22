import React from "react";
import SimpleTable, {
  TdMedium,
  TrColumnNames,
  TrTableRow
} from "components/simpleTable/simpleTable";
import { buildRating } from "tools/product";
import Leaf from "assets/icon/22/leaf-fillable.svg";
import Star from "assets/icon/22/star-fillable.svg";
import Title from "components/Title/Title";

interface IProductDetailFundsAnalysisTableProps {
  product: any;
}

export const ProductDetailFundsAnalysisTable: React.FC<IProductDetailFundsAnalysisTableProps> = ({
  product
}) => {
  return (
    <div style={{ marginTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title.Widget
          name={
            <div style={{ display: "flex" }}>
              Rating BCC R&amp;P
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: "20px",
                  height: "1em"
                }}
              >
                {product?.productRatingDTO?.finalRating != null
                  ? buildRating(product?.productRatingDTO?.finalRating).map(
                      (ratingPercentageFillClass: string, index: number) => (
                        <img
                          alt=""
                          key={`star-${index}`}
                          src={Star}
                          className={`svgStarClass_${ratingPercentageFillClass}`}
                        />
                      )
                    )
                  : "-"}
              </div>
            </div>
          }
        />
      </div>
      <SimpleTable
        titleClassName="centered"
        innerTableStyle={{ tableLayout: "fixed" }}
        simpleTableStyle={{ marginTop: "20px" }}
      >
        <>
          <thead>
            <TrColumnNames style={{ textAlign: "center" }}>
              <th>Rating ESG</th>
              <th>Qualitativa</th>
              <th>Quantitativa</th>
            </TrColumnNames>
          </thead>
          <tbody>
            <TrTableRow className="withBorder">
              <TdMedium>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {product?.productRatingDTO?.esgScore != null
                    ? buildRating(product?.productRatingDTO?.esgScore).map(
                        (ratingPercentageFillClass: string, index: number) => (
                          <img
                            alt=""
                            key={`leaf-${index}`}
                            src={Leaf}
                            className={`svgLeafClass_${ratingPercentageFillClass}`}
                          />
                        )
                      )
                    : "-"}
                </div>
              </TdMedium>
              <TdMedium style={{ textAlign: "center" }}>
                {product?.productRatingDTO?.qualitativeScore
                  ? `${product?.productRatingDTO?.qualitativeScore}/10`
                  : "-"}
              </TdMedium>
              <TdMedium style={{ textAlign: "center" }}>
                {product?.productRatingDTO?.quantitativeJudgement
                  ? `${product?.productRatingDTO?.quantitativeJudgement}/5`
                  : "-"}
              </TdMedium>
            </TrTableRow>
          </tbody>
        </>
      </SimpleTable>
      {product?.productRatingDTO?.qualitativeJudgement && (
        <SimpleTable
          titleClassName="centered"
          innerTableStyle={{ tableLayout: "fixed" }}
        >
          <>
            <tbody>
              <TrTableRow className="withBorder greyedOut">
                <TdMedium>
                  <div style={{ width: "100%" }}>
                    {product?.productRatingDTO?.qualitativeJudgement}
                  </div>
                </TdMedium>
              </TrTableRow>
            </tbody>
          </>
        </SimpleTable>
      )}
    </div>
  );
};
