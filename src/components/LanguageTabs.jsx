import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";

const LanguageTabs = ({ children }) => {
  const [activeKey, setActiveKey] = useState("uk");

  return (
    <Tabs
      activeKey={activeKey}
      onSelect={(k) => setActiveKey(k)}
      className="mb-3"
    >
      <Tab eventKey="uk" title="УКР">
        {children("uk")}
      </Tab>
      <Tab eventKey="en" title="ENG">
        {children("en")}
      </Tab>
    </Tabs>
  );
};

export default LanguageTabs;