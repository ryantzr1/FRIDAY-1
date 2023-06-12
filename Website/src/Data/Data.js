// Sidebar imports
import {
  UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  UilChart,
} from "@iconscout/react-unicons";

// Recent Card Imports
import img from "../imgs/profile2.png";


// Sidebar Data
export const SidebarData = [
  {
    icon: UilEstate,
    heading: "Dashboard",
    url: "",
  },
  {
    icon: UilUsersAlt,
    heading: "Activity Log",
    url: "log",
  },
  {
    icon: UilClipboardAlt,
    heading: "Set Up Bot",
    url: "setup",
  },
  {
    icon: UilChart,
    heading: 'Analytics',
    url: "analytics"

  },
];

// Analytics Cards Data
export const cardsData = [
  {
    title: "Successful Queries",
    color: {
      backGround: "linear-gradient(180deg, black 0%, #3F4250 100%)",
      boxShadow: "0px 10px 20px 0px #3F4250",
    },
    barValue: 98,
    value: "87",
    series: [
      {
        name: "Queries",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
    ],
  },
  {
    title: "Unanswered Queries",
    color: {
      backGround: "linear-gradient(180deg, black 0%, #3F4250 100%)",
      boxShadow: "0px 10px 20px 0px #3F4250",
    },
    barValue: 5,
    value: "5",
    series: [
      {
        name: "Unanswered Queries",
        data: [10, 100, 50, 70, 80, 30, 40],
      },
    ],
  },
];

// Recent Update Card Data
export const UnansweredQueries = [
  {
    img: img,
    noti: "direct hard drop on floor?",
    time: "3 Days Ago",
  },
  {
    img: img,
    noti: "If I drop the drone in the water for a while, will it still work?",
    time: "3 Days Ago",
  },
  {
    img: img,
    noti: "Can I buy the drone at a discount?",
    time: "6 Days Ago",
  },
];
