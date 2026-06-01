import React, { FC } from "react";
import WithLoader from "../WithLoader/WithLoader";
import "./Favorite.scss";

interface IProps {
  preferred: boolean;
  className?: string;
  id?: string;
  onToggle?: Function;
  loading?: boolean;
}

const Favorite: FC<IProps> = ({
  preferred,
  id,
  onToggle = () => undefined,
  className = "",
  loading = false
}) => {
  return (
    <WithLoader
      loading={loading}
      spinnerSize={"small"}
      className={"Favorite__loader"}
    >
      <i
        id={id}
        className={`favoriteIcon ${
          preferred ? "icon-star-select" : "icon-star"
        } ${className}`}
        onClick={e => onToggle(e, id, !preferred)}
      />
    </WithLoader>
  );
};

export default Favorite;
