import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RxDashboard, RxPerson } from "react-icons/rx";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FiSettings, FiDatabase } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../config/firebase";

const Sidebar = ({ children }) => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex">
      <div className="w-20 lg:w-40"></div>
      <div className="fixed w-20 lg:w-40 h-screen bg-white border-r-[1px] flex flex-col justify-between">
        <div className="flex flex-col items-center">
          <Link href="/">
            <div className="mb-4 flex justify-center">
              <Image
                src="/logo2.svg"
                alt="FRIDAY Logo"
                className="dark:invert"
                width={80}
                height={40}
                priority
              />
            </div>
          </Link>
          <span className="border-b-[1px] border-gray-200 w-full"></span>
          <div className="flex flex-col sm:items-center lg:items-start">
            <Link href="/">
              <div
                className={`hover:bg-gray-700 hover:text-white transition-colors cursor-pointer my-2 py-2 px-2 rounded-md w-full inline-flex items-center ${
                  router.pathname === "/" ? "text-black bg-green-500 lg:bg-white" : "text-gray-400"
                }`}
              >
                {router.pathname === "/" && (
                  <div className="bg-green-500 w-1 h-6 mr-2 hidden lg:block"></div>
                )}
                <RxDashboard size={20} className="mr-2 pl-2 lg:pl-0" />
                <span className="hidden lg:block text-sm">Dashboard</span>
              </div>
            </Link>
            <Link href="/logs">
              <div
                className={`hover:bg-gray-700 hover:text-white transition-colors cursor-pointer my-2 py-2 px-2 rounded-md w-full inline-flex items-center ${
                  router.pathname === "/logs" ? "text-black bg-green-500 lg:bg-white" : "text-gray-400"
                }`}
              >
                {router.pathname === "/logs" && (
                  <div className="bg-green-500 w-1 h-6 mr-2 hidden lg:block"></div>
                )}
                <RxPerson size={20} className="mr-2 pl-2 lg:pl-0" />
                <span className="hidden lg:block text-sm">Activity Log</span>
              </div>
            </Link>
            <Link href="/database">
              <div
                className={`hover:bg-gray-700 hover:text-white transition-colors cursor-pointer my-2 py-2 px-2 rounded-md w-full inline-flex items-center ${
                  router.pathname === "/database"
                    ? "text-black bg-green-500 lg:bg-white"
                    : "text-gray-400"
                }`}
              >
                {router.pathname === "/database" && (
                  <div className="bg-green-500 w-1 h-6 mr-2 hidden lg:block"></div>
                )}
                <FiDatabase size={20} className="mr-2 pl-2 lg:pl-0" />
                <span className="hidden lg:block text-sm">Database</span>
              </div>
            </Link>
            <Link href="/analytics">
              <div
                className={`hover:bg-gray-700 hover:text-white transition-colors cursor-pointer my-2 py-2 px-2 rounded-md w-full inline-flex items-center ${
                  router.pathname === "/analytics"
                    ? " text-black bg-green-500 lg:bg-white"
                    : "text-gray-400"
                }`}
              >
                {router.pathname === "/analytics" && (
                  <div className="bg-green-500 w-1 h-6 mr-2 hidden lg:block"></div>
                )}
                <HiOutlineShoppingBag size={20} className="mr-2 pl-2 lg:pl-0" />
                <span className="hidden lg:block text-sm">Analytics</span>
              </div>
            </Link>
            <Link href="/settings">
              <div
                className={`hover:bg-gray-700 hover:text-white transition-colors cursor-pointer my-2 py-2 px-2 rounded-md w-full inline-flex items-center ${
                  router.pathname === "/settings"
                    ? "text-black bg-green-500 lg:bg-white"
                    : "text-gray-400"
                }`}
              >
                {router.pathname === "/settings" && (
                  <div className="bg-green-500 w-1 h-6 mr-2 hidden lg:block"></div>
                )}
                <FiSettings size={20} className="mr-2 pl-2 lg:pl-0" />
                <span className="hidden lg:block text-sm">Settings</span>
              </div>
            </Link>
          </div>
        </div>
        {loggedIn && (
          <div className=" px-2 pb-3 lg:p-5 flex justify-center">
            <button
              className="w-full lg:w-3/4 text-xs lg:text-md max-w-xs sm:max-w-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 py-2"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Sidebar;
