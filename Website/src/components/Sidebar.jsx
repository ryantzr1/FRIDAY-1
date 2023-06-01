import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from 'react-router-dom';
import { SidebarData } from "../Data/Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";
import Logo from "../imgs/icon3.png";

const Sidebar = () => {
  const [selected, setSelected] = useState(0);

  const [expanded, setExpaned] = useState(true)

  const sidebarVariants = {
    true: {
      left : '0'
    },
    false:{
      left : '-60%'
    }
  }
  return (
    <>
      <div className="bars" style={expanded?{left: '60%'}:{left: '5%'}} onClick={()=>setExpaned(!expanded)}>
        <UilBars />
      </div>
    <motion.div className='sidebar'
    variants={sidebarVariants}
    animate={window.innerWidth<=768?`${expanded}`:''}
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
              className={selected === index ? "menuItem active" : "menuItem"}
              key={index}
              onClick={() => setSelected(index)}
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

export default Sidebar;
