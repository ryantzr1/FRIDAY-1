import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import IncomingRequestsCard from "../components/IncomingRequestsCard";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const { getUid } = useAuth();
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfoResponse = await axios.get(
          "https://friday-backend-beta-fd0f1e9f6d88.herokuapp.com/userInfo",
          {
            params: {
              uid: getUid(),
            },
          }
        );

        setUserInfo(userInfoResponse.data);

        console.log(userInfoResponse);

        let queryName = userInfoResponse.data.name.toLowerCase();

        console.log(queryName);

        if (queryName == "friday") {
          queryName = "dashcamsg";
        }

        const response = await axios.get(
          `https://friday-backend-beta-fd0f1e9f6d88.herokuapp.com/${queryName}/log`
        );

        const { queries } =
          response.data;
        console.log(queries);
        setLogs(queries);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false); // Set loading state to false after data is fetched (or in case of error)
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4 text-green-900">Logs</h1>
      <div>
        {isLoading ? ( // Render loading spinner if isLoading is true
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <IncomingRequestsCard logs={logs} userInfo={userInfo} />
        )}
      </div>
    </div>
  );
}

export default LogsPage;