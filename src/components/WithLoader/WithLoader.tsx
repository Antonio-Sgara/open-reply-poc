import React, { FC } from "react";

interface WithLoaderProps {
  loading?: boolean;
  spinnerSize?: "small" | "medium" | "large" | string;
  className?: string;
  children?: React.ReactNode;
}

const WithLoader: FC<WithLoaderProps> = ({
  loading = false,
  spinnerSize = "medium",
  className = "",
  children
}) => {
  return (
    <div
      className={`WithLoader ${className}`.trim()}
      style={{ position: "relative", display: "inline-block" }}
    >
      {children}
      {loading && (
        <div
          className={`LoaderWidgetAbsoluteMiddle LoaderWidgetAbsoluteMiddle--${spinnerSize}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid rgba(38, 77, 122, 0.2)",
            borderTopColor: "#264d7a",
            animation: "withLoaderSpin 0.8s linear infinite"
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default WithLoader;
