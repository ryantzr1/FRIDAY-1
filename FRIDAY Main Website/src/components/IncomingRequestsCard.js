import { useState } from "react";
import RequestContainer from "./RequestContainer";

function IncomingRequestsCard({ logs }) {
  const [showSuccessfulQueries, setShowSuccessfulQueries] = useState(false);

  const handleFilterButtonClick = () => {
    setShowSuccessfulQueries(!showSuccessfulQueries);
  };

  const filteredLogs = showSuccessfulQueries
    ? logs.filter((log) => !log.success)
    : logs;

  return (
    <div className={`bg-white rounded-lg shadow p-8 overflow-y-scroll`} style={{ maxHeight: '550px' }}>
      <div className="flex justify-between mb-4">
        <div className="text-sm text-gray-500 uppercase tracking-wide">
          Incoming Requests
        </div>
        <button
          className={`text-sm rounded-full font-medium py-2 px-4 ${
            showSuccessfulQueries
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
          onClick={handleFilterButtonClick}
        >
          {showSuccessfulQueries ? "Unsuccessful" : "All"}
        </button>
      </div>
      <div className="text-gray-800">
        {filteredLogs.map((log, index) => (
          <RequestContainer key={index} log={log} />
        ))}
      </div>
    </div>
  );
}

export default IncomingRequestsCard;
