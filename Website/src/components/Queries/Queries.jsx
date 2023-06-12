import React from "react";
import "./Queries.css";
import { UnansweredQueries } from "../../Data/Data";

const Queries = () => {
  return (
    <div className="queries">
      {UnansweredQueries.map((data) => {
        return (
          <div className="query">
            <img src={data.img} alt="profile" />
            <div className="noti">
              <div  style={{marginBottom: '0.5rem'}}>
                <span> {data.noti}</span>
              </div>
                <span>{data.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Queries;
