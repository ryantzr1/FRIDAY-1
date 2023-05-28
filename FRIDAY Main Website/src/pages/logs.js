import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import IncomingRequestsCard from "../components/IncomingRequestsCard";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const { getUid } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (getUid() && (getUid() === "lZLIC6fK2WQOvIxyXKECEjx625w1" || getUid() === "Hoz3NtloWXX7MciVcTn8BNAHIJs1")) {
        const response = await axios.get("https://friday-backend-server-new.herokuapp.com/queries/log");
        const { queries } = response.data;
        setLogs(queries);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8 h-screen">
      <h1 className="text-3xl font-bold mb-4">Logs</h1>
      <div className="h-full">
        <IncomingRequestsCard logs={logs} />
      </div>
    </div>
  );
}

export default LogsPage;