import { useState } from "react";
import RequestContainer from "./RequestContainer";
import axios from "axios";

function IncomingRequestsCard({ logs }) {
  const [showSuccessfulQueries, setShowSuccessfulQueries] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [updatedCategories, setUpdatedCategories] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleFilterButtonClick = () => {
    setShowSuccessfulQueries(!showSuccessfulQueries);
  };

  const filteredLogs = showSuccessfulQueries ? logs.filter((log) => !log.success) : logs;

  const handleCategoryUpdate = (id, category) => {
    setUpdatedCategories((prevState) => ({
      ...prevState,
      [id]: category
    }));
  };

  const handleSaveButtonClick = () => {
    // Iterate through updatedCategories and send axios requests to update the categories
    const updateRequests = Object.entries(updatedCategories).map(([id, category]) => {
      return axios.post("https://friday-backend-server-new.herokuapp.com/updateCategory", { id, category });
    });

    // Send all update requests concurrently
    axios
      .all(updateRequests)
      .then(() => {
        setSaveStatus("success");
        setShowModal(true);
      })
      .catch((error) => {
        setSaveStatus("error");
        setShowModal(true);
        console.error("Error updating categories:", error);
      });
  };

  const closeModal = () => {
    setShowModal(false);
    setSaveStatus(null);
  };

  return (
    <div className={`bg-white rounded-xs shadow overflow-y-scroll`} style={{ maxHeight: "550px" }}>
      <header className="sticky top-0 bg-gray-900">
        <div className="flex justify-between container mx-auto">
          <div className="text-sm p-6 text-white uppercase tracking-wide">
            Incoming Requests
          </div>
          <div>
            <button
              className={`text-sm rounded-full font-medium mr-2 py-2 px-4 ${
                showSuccessfulQueries ? "bg-red-500 text-white" : "bg-gray-300 text-gray-600"
              }`}
              onClick={handleFilterButtonClick}
            >
              {showSuccessfulQueries ? "Unsuccessful" : "All"}
            </button>
            <button
              className="bg-green-500 text-black text-sm m-4 rounded-full font-medium py-2 px-4 ml-2"
              onClick={handleSaveButtonClick}
            >
              Save
            </button>
          </div>
        </div>
      </header>
      <div className="text-gray-800 m-8">
        {filteredLogs.map((log, index) => (
          <RequestContainer key={index} log={log} onCategoryChange={handleCategoryUpdate} />
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6">
            {saveStatus === "success" ? (
              <p className="text-green-500">Categories saved successfully.</p>
            ) : (
              <p className="text-red-500">Error saving categories.</p>
            )}
            <div className="flex justify-center items-center">
              <button
                className="bg-blue-500 text-white text-sm rounded-full font-medium py-2 px-4 mt-4"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomingRequestsCard;