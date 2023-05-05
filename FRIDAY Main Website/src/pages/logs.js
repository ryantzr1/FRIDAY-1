import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";
import axios from "axios";

import IncomingRequestsCard from "../components/IncomingRequestsCard";

function LogsPage() {
  const [logs, setLogs] = useState([]);

  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated on every route change
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to the login page if the user is not authenticated
        router.push("/login");
      }
    });

    // Unsubscribe from the listener when the component unmounts
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("https://friday-backend-server-new.herokuapp.com/queries/log");
      const { queries } = response.data;
      setLogs(queries);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen">
      <h1 className="text-4xl font-bold py-8">Logs</h1>
      <div className="h-full">
        <IncomingRequestsCard logs={logs} />
      </div>
    </div>
  );
}

export default LogsPage;