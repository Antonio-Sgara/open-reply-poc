/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { fetchProductDetails } from "../../store/product/product.service";
import localProducts from "../../products.json";
import { ProductDetails } from "./product-details";
import { productDetailIncludedFields } from "../../model/product";

interface RouteParams {
  productCode: string;
}

const ProductDetailsContainerInner: React.FC<RouteComponentProps<RouteParams>> = ({
  match
}) => {
  const [productDetail, setProductDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productCode = match.params.productCode;
    const localProduct = (localProducts as any[]).find(
      product =>
        String(product.productId) === String(productCode) ||
        String(product.isin) === String(productCode)
    );

    setLoading(true);
    setError(null);

    fetchProductDetails({
      productCode,
      includeFields: [...productDetailIncludedFields, "FUNDCATEGORIESANALYSIS"]
    })
      .then(product => {
        setProductDetail(product || localProduct || null);
      })
      .catch(() => {
        setProductDetail(localProduct || null);
        if (!localProduct) {
          setError("Prodotto non trovato");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [match.params.productCode]);

  return (
    <ProductDetails
      product={productDetail}
      loading={loading}
      error={error}
    />
  );
};

export const ProductDetailsContainer = withRouter(ProductDetailsContainerInner);
