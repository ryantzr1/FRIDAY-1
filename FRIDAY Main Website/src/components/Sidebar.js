import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RxSketchLogo, RxDashboard, RxPerson } from 'react-icons/rx';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";

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
    <div className='flex'>
      <div className='fixed w-50 h-screen p-4 bg-white border-r-[1px] flex flex-col justify-between'>
        <div className='flex flex-col items-center'>
          <Link href='/'>
            <div >
              <Image
                src="/logo.svg"
                alt="FRIDAY Logo"
                className="dark:invert"
                width={40}
                height={20}
                priority
              />
            </div>
          </Link>
          <span className='border-b-[1px] border-gray-200 w-full p-2'></span>
          <Link href='/'>
            <div className='hover:bg-black hover:text-white transition-colors cursor-pointer my-4 p-3 rounded-lg inline-block'>
              <RxDashboard size={20} className='inline-block'/>
              <span className='ml-4 text-sm'>Dashboard</span>
            </div>
          </Link>
          <Link href='/logs'>
            <div className='hover:bg-black hover:text-white transition-colors cursor-pointer my-4 p-3 rounded-lg inline-block'>
              <RxPerson size={20} className='inline-block'/>
              <span className='ml-4 text-sm'>Activity Log</span>
            </div>
          </Link>
          <Link href='/analytics'>
            <div className='hover:bg-black hover:text-white transition-colors cursor-pointer my-4 p-3 rounded-lg inline-block'>
              <HiOutlineShoppingBag size={20} className='inline-block'/>
              <span className='ml-4 text-sm'>Analytics</span>
            </div>
          </Link>
          <Link href='/reports'>
            <div className='hover:bg-black hover:text-white transition-colors cursor-pointer my-4 p-3 rounded-lg inline-block'>
              <FiSettings size={20} className='inline-block'/>
              <span className='ml-4 text-sm'>Settings</span>
            </div>
          </Link>
        </div>
        {loggedIn && (
        <div className="p-2">
          <button
            className="w-full rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 py-2"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
      </div>
      <main className='ml-20 w-full'>{children}</main>
    </div>
  );
};

export default Sidebar;
