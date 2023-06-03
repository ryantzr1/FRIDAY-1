import React, { useState } from "react";
import { auth } from "../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

function SettingsPage() {
  const [isPasswordAccordionOpen, setPasswordAccordionOpen] = useState(false);
  const [isAPIKeyAccordionOpen, setAPIKeyAccordionOpen] = useState(false);
  const [apiKey, setAPIKey] = useState("************");
  const [showAPIKey, setShowAPIKey] = useState(false);

  const handlePasswordAccordionToggle = () => {
    setPasswordAccordionOpen(!isPasswordAccordionOpen);
  };

  const handleAPIKeyAccordionToggle = () => {
    setAPIKeyAccordionOpen(!isAPIKeyAccordionOpen);
  };

  const handleSendPasswordResetEmail = () => {
    const user = auth.currentUser;
    if (user) {
      auth
        .sendPasswordResetEmail(user.email)
        .then(() => {
          toast.success("Password reset email sent successfully");
        })
        .catch((error) => {
          toast.error("Error sending password reset email");
          console.log("Error sending password reset email:", error);
        });
    }
  };
  const { user } = useAuth();

  const handleAPIKeyReveal = () => {
    fetch("/api/generateAPIKeys?uid=" + user.uid, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setAPIKey(data.user); // Assuming the API returns an object with an `apiKey` field
        setShowAPIKey(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const hideAPIKey = () => {
    setShowAPIKey(false);
  };

  const getHiddenAPIKey = () => {
    return "*".repeat(apiKey.length);
  };

  return (
    <div className="pt-4 px-4 h-screen">
      <div className="w-full max-w-screen-2xl">
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-900">Settings</h1>
          </div>
          <div className="border-t border-gray-300 pt-4">
            <div className="mb-4">
              <button
                className="w-full flex items-center justify-between bg-white text-gray-800 font-medium py-2 px-4 rounded-lg focus:outline-none"
                onClick={handlePasswordAccordionToggle}
              >
                <span>Reset Password</span>
                <svg
                  className={`ml-2 h-5 w-5 transform transition-transform ${
                    isPasswordAccordionOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isPasswordAccordionOpen && (
                <div className="mt-4 flex justify-center">
                  <button
                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg"
                    onClick={handleSendPasswordResetEmail}
                  >
                    Send email to user to reset password
                  </button>
                </div>
              )}
            </div>
            <div className="mb-4">
              <button
                className="w-full flex items-center justify-between bg-white text-gray-800 font-medium py-2 px-4 rounded-lg focus:outline-none"
                onClick={handleAPIKeyAccordionToggle}
              >
                <span>Access API Key</span>
                <svg
                  className={`ml-2 h-5 w-5 transform transition-transform ${
                    isAPIKeyAccordionOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isAPIKeyAccordionOpen && (
                <div className="mt-4 flex items-center justify-center">
                  {showAPIKey ? (
                    <input
                      type="text"
                      value={apiKey}
                      readOnly
                      className="w-1/2 lg:w-5/6 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 mr-5"
                    />
                  ) : (
                    <input
                      type="text"
                      value={getHiddenAPIKey()}
                      readOnly
                      className="w-1/2 lg:w-5/6 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 mr-5"
                    />
                  )}
                  <button
                    className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg"
                    onClick={showAPIKey ? hideAPIKey : handleAPIKeyReveal}
                  >
                    {showAPIKey ? "Hide Key" : "Reveal Key"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer /> {/* Add this component to the root of your app */}
    </div>
  );
}

export default SettingsPage;
