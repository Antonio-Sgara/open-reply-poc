import React from "react";
import { Popover } from "react-bootstrap";

export const pledgePopover = (product: any) => (
  <Popover id="pledge-popover">
    <Popover.Body>
      {product?.lockedAsPartOfPotentialPtf
        ? "Prodotto vincolato come parte di un portafoglio potenziale"
        : "Prodotto non disponibile"}
    </Popover.Body>
  </Popover>
);
