import React from "react";
import { useTranslations } from "../hooks/useTranslations";

const Loading = () => {
  const { t } = useTranslations();
  
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">{t("common.loading")}</span>
      </div>
    </div>
  );
};

export default Loading;