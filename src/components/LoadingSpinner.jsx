import React from "react";
import { useTranslations } from "../hooks/useTranslations";

const LoadingSpinner = () => {
  const { t } = useTranslations();
  
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t("common.loading")}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;