import React, { useState, useEffect } from "react";
import "./navpill.css";

function NavPill() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      //below console stmt will print width height scroll pos of browser
      console.log(`Width: ${window.innerWidth}, Height: ${window.innerHeight}, Scroll: ${scrollPosition}`);

      if (scrollPosition >= 830)  //for my browser its 830 idk if it will be same for u
                                    //u can check the console of webpage to see at what position
                                  //pink bg tranitions insert that value 
         {
        setShowNavbar(true); 
      } else
       {
        setShowNavbar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
         {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`navbar ${showNavbar ? "show" : ""}`}>
      <div className="navbar-logo">
    <ul className="navbar-menu">
        <li><a href="/">Home</a></li>
          <li><a href="/homepage">Chat</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </div>
    </div>
  );
}

export default NavPill;
