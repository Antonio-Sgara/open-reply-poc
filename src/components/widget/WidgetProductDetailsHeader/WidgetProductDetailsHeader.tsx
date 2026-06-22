import { Col, Row } from "react-bootstrap";
import FinancialPanel from "../../FinancialPanel";
import Title from "../../Title/Title";
import React from "react";
import SimpleTable, {
  TdSmall,
  TrColumnNames,
  TrTableRow
} from "../../simpleTable/simpleTable";
import { Badge } from "../../Badge/Badge";
import { FormattedMessage } from "react-intl";
import { getMainTableData } from "../../../pages/products/products-utils";
import { ProductDetailFundsAnalysisTable } from "components/ProductDetailFundsAnalysisTable/ProductDetailFundsAnalysisTable";
import "./WidgetProductDetailsHeader.scss";

interface IProps {
  product: any;
  productType: string;
  shouldRender?: boolean;
}

export const WidgetProductDetailsHeader: React.FC<IProps> = ({
  product,
  productType,
  shouldRender
}) => {
  const mainTableData = getMainTableData(product);

  if (shouldRender === false) return null;

  return (
    <Row>
      <Col xs={12}>
        <FinancialPanel title="" className="p-4">
          <div className="clearfix w-100">
            <div className="float-left d-flex">
              <div>
                <Title.FullPage
                  name={product.name?.toLocaleUpperCase()}
                  className="no-lineHeight"
                />
                <div className="subtitle">
                  <FormattedMessage
                    id={`common.label.productType.${product?.productType}`}
                  />
                </div>
              </div>
            </div>
            <div className="float-right mt-1">
              <span className="mr-3">
                <Badge
                  name={`SRRI: ${
                    Number.isFinite(Number(product.riskKiid))
                      ? product.riskKiid
                      : "- -"
                  }`}
                  color="basegrey"
                  thin
                />
              </span>
              {product.coupon && (
                <Badge
                  name={<FormattedMessage id="common.label.withCoupon" />}
                  color="basegrey"
                  thin
                />
              )}
            </div>
          </div>

          <Table data={mainTableData} />
          {product.productRatingDTO && (
            <ProductDetailFundsAnalysisTable product={product} />
          )}
        </FinancialPanel>
      </Col>
    </Row>
  );
};

const Table = ({ data }: any) => (
  <SimpleTable className="widgetProductDetail__table mt-4">
    <thead>
      <TrColumnNames>
        {data.columns.map((col: any) => (
          <th key={String(col)}> {col} </th>
        ))}
      </TrColumnNames>
    </thead>
    <tbody>
      <TrTableRow className="colorBlue withBorder" key="0_9877">
        {data.values.map((tdValue: any, index: number) => (
          <TdSmall key={`detail-cell-${index}`}> {tdValue} </TdSmall>
        ))}
      </TrTableRow>
    </tbody>
  </SimpleTable>
);
