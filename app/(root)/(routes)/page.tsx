"use client";

import CommissionPlanTable from "@/app/components/CommissionPlanTable";
import CommissionSimulation from "@/app/components/CommissionSimulation";
import { Page } from "@shopify/polaris";

const HomePage = () => {
  return (
    <Page fullWidth>
      <div style={{ height: "100vh" }}>
        <CommissionPlanTable />

        <div style={{ marginTop: "15px" }}>
          <CommissionSimulation />
        </div>
      </div>
    </Page>
  );
};

export default HomePage;
