import React from "react";

import ManageSubscription from "./subcription-plan/manage-subscription";

function MyPlanTabSection() {
  return (
    <div className="gap-v1-structural-content-relaxed md:gap-v1-structural-section-standard flex flex-col">
      <ManageSubscription />
    </div>
  );
}

export default MyPlanTabSection;
