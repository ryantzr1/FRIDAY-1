import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from 'react-router-dom';
import { SidebarData } from "../Data/Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";
import Logo from "../imgs/icon3.png";

const Sidebar4 = () => {
  const [current, setCurrent] = useState(3);

  const [enlarged, setEnlarged] = useState(true)

  const sidebarVariants = {
    true: {
      left : '2'
    },
    false:{
      left : '-59%'
    }
  }
  console.log(window.innerWidth)
  return (
    <>
      <div className="bars" style={enlarged?{left: '60%'}:{left: '5%'}} onClick={()=>setEnlarged(!enlarged)}>
        <UilBars />
      </div>
    <motion.div className='sidebar'
    variants={sidebarVariants}
    animate={window.innerWidth<=768?`${enlarged}`:''}
    >
      <div className="logo">
        <img src={Logo} alt="logo" />
        <span>
          F.R.I.<span>D.A.Y.</span>
        </span>
      </div>
      <div className="menu">
        {SidebarData.map((item, index) => {
          return (
            <Link
              className={current === index ? "menuItem active" : "menuItem"}
              key={index}
              onClick={() => setCurrent(index)}
              to={"/" + item.url}
            >
              <item.icon />
              <span>{item.heading}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
    </>
  );
};

export default Sidebar4;