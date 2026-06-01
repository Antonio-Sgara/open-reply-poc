import React, { FC, useState, useEffect } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import "../../model/questionnaire";
import Title from "components/Title/Title";
import WidgetProductsList from "components/widget/WidgetProductList/WidgetProductList";
import { FilterToggleButton } from "components/FilterButtons/FilterButtons";
import { useSelector } from "react-redux";

interface IProps {
  alerts: any;
}

export const ProductsPage: FC<IProps> = props => {
  const [selectedView, setSelectedView] = useState("products");
  const savedFilters = useSelector((state: any) => state.product.filters);

  useEffect(() => {
    if (savedFilters?.isShowingFundsAnalysis) {
      setSelectedView("fundsAnalysis");
    }
  }, []);

  const selectViewFilters = [
    {
      id: "products",
      name: "Catalogo Fondi"
    },
    {
      id: "fundsAnalysis",
      name: "Analisi Categorie Fondi"
    }
  ];

  return (
    <Container>
      <Tabs
        className={"tabsCustomSection wide noPadding"}
        style={{ marginTop: "32px" }}
        defaultActiveKey="products"
        id="uncontrolled-tab-example"
      >
        <Tab
          eventKey="products"
          title={
            <div style={{ cursor: "auto", textAlign: "left", width: "100%" }}>
              <Title.Tab name="Prodotti" />
              <div
                className="filterButtons__wrapper financialAdviceCardContainerNav__filters"
                style={{ marginTop: "20px", cursor: "auto" }}
              >
                <div className="filterButtons filterButtons--big">
                  {selectViewFilters.map(filter => {
                    return (
                      <FilterToggleButton
                        id={`${filter.id}-filter-button`}
                        name={filter.name}
                        active={selectedView === filter.id}
                        key={`${filter.id}-filter-button`}
                        clicked={() => setSelectedView(filter.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          }
        >
          <div className={"tabsCustomSection__content"}>
            <WidgetProductsList selectedView={selectedView} />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};
