import React from "react";
import UserActivity from "../UserActivity/UserActivity";
import Queries from "../Queries/Queries";
import "./RightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <h3>Unanswered Queries</h3>
        <Queries />
      </div>
      <div>
        <h3>User Activity</h3>
        <UserActivity />
      </div>
    </div>
  );
};

export default RightSide;
