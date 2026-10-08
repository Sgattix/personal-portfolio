"use client";
import Image from "next/image";
import { FunctionComponent, useEffect } from "react";
import NavLink from "./NavLink";

const Navbar: FunctionComponent = () => {
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (window.scrollY > 50) {
        nav?.classList.add("opacity-50");
      } else {
        nav?.classList.remove("opacity-50");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="w-full h-fit p-8 lg:flex block justify-between items-center fixed top-0 z-50 overflow-hidden gap-10 px-[17%] transition-all duration-300 hover:opacity-100 backdrop-blur-xs bg-black/50">
      <div className=" flex items-center gap-5">
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={40}
          height={75}
          className="h-10 w-auto"
        />
        <h1 className="lg:text-2xl text-lg font-bold text-white">
          Alessandro Sgattoni
        </h1>
      </div>
      <div>
        <ul className="flex gap-5">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/contributions">Contributions</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
