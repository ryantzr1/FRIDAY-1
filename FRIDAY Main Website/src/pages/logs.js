import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import IncomingRequestsCard from "../components/IncomingRequestsCard";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const { getUid } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (getUid() && (getUid() === "lZLIC6fK2WQOvIxyXKECEjx625w1" || getUid() === "Hoz3NtloWXX7MciVcTn8BNAHIJs1")) {
        try {
          const response = await axios.get("https://friday-backend-server-new.herokuapp.com/queries/log");
          const { queries } = response.data;
          setLogs(queries);
        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setIsLoading(false); // Set loading state to false after data is fetched (or in case of error)
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8 h-screen">
      <h1 className="text-3xl font-bold mb-4">Logs</h1>
      <div className="h-full">
        {isLoading ? ( // Render loading spinner if isLoading is true
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <IncomingRequestsCard logs={logs} />
        )}
      </div>
    </div>
  );
}

export default LogsPage;