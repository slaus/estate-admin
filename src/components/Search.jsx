import React from "react";
import { useTranslations } from "../hooks/useTranslations";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const Search = ({ search, setSearch }) => {
  const { t } = useTranslations();

  return (
    <Card className="mb-4">
      <Card.Body>
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </Card.Body>
    </Card>
  );
};

export default Search;
