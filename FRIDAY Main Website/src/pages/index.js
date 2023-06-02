import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function CounterCard({ value, limit, label, color }) {
  return (
    <div
      className={`bg-white rounded-xs shadow-2xl p-8 flex-grow-0 flex-shrink-0 w-1/2 mr-4 border border-gray-400`}
    >
      <div className={`text-3xl font-bold ${color} mb-2`}>{value} {limit && <span className="text-black">/ {limit}</span>}</div>
      <div className="text-sm text-gray-700 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function IncomingRequestsCard({ logs }) {
  const unsuccessful = logs.filter((log) => !log.success).slice(0, 3);
  return (
    <div
      className={`bg-white rounded-xs shadow-2xl p-8 ml-2 overflow-y-scroll border border-gray-400`}
      style={{ maxHeight: "400px" }}
    >
      <div className="text-sm text-gray-700 uppercase tracking-wide mb-4">
        Latest Unsuccessful Requests
      </div>
      <div className="text-gray-800">
        {unsuccessful.map((log, index) => (
          <RequestContainer key={index} log={log} />
        ))}
      </div>
    </div>
  );
}

function RequestContainer({ log }) {
  const { question, answer, success } = log;
  const successColor = success ? "text-green-500" : "text-red-500";

  return (
    <div className="border border-green-500 rounded-md p-4 flex items-center justify-between mb-4 shadow-sm">
      <div>
        <div className="font-bold">Question:</div>
        <div className="text-gray-700">{question}</div>
        <div className="font-bold mt-4">Answer:</div>
        <div className={`text-sm font-bold ${successColor}`}>{answer}</div>
      </div>
      <div className={`bg-gray-200 rounded-full px-2 py-1 ${successColor}`}>
        {success ? "Answered" : "Unanswered"}
      </div>
    </div>
  );
}

function Home() {
  const [totalQueries, setTotalQueries] = useState(0);
  const [unansweredQueries, setUnansweredQueries] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUid } = useAuth();
  const [limit, setLimit] = useState(0); // Added limit state

  useEffect(() => {
    async function fetchData() {
      try {
        if (
          getUid() &&
          (getUid() === "lZLIC6fK2WQOvIxyXKECEjx625w1" ||
            getUid() === "Hoz3NtloWXX7MciVcTn8BNAHIJs1")
        ) {
          const response = await axios.get(
            "https://friday-backend-server-new.herokuapp.com/queries/log"
          );
          const { queries, totalQueriesCount, unansweredQueriesCount } =
            response.data;
          setLogs(queries);
          setTotalQueries(totalQueriesCount);
          setUnansweredQueries(unansweredQueriesCount);
        }

        const userInfoResponse = await axios.get(
          "https://friday-backend-server.herokuapp.com/userInfo",
          {
            params: {
              uid: getUid(),
            },
          }
        );
        console.log(userInfoResponse);
        const userLimit = userInfoResponse.data.limit;
        console.log(userLimit);
        setLimit(userLimit);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="pt-8 px-4 sm:px-6 lg:px-8 mr-2">
      <h1 className="text-3xl font-bold mb-4 text-green-900">My Dashboard</h1>
      <div className="flex justify-between mb-8">
        <CounterCard
          value={`${totalQueries}`}
          limit={limit}
          label="Total Queries / Limit"
          color="text-green-500"
        />
        <CounterCard
          value={unansweredQueries}
          label="Unanswered Queries"
          color="text-red-500"
        />
      </div>
      {isLoading ? (
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
        <IncomingRequestsCard logs={logs} />
      )}
    </main>
  );
}

export default Home;
