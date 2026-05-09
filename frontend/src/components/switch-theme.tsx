"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaDesktop } from "react-icons/fa";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

export default function SwitchTheme() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const setDarkTheme = () => setTheme("dark");
  const setLightTheme = () => setTheme("light");
  const setSystemTheme = () => setTheme("system");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-10 px-4 py-1 justify-center rounded-2xl border border-border">
      <Button
        variant="ghost"
        onClick={setLightTheme}
        className={`${mounted && theme === "light" ? "text-blue-400" : ""} rounded-lg`}
      >
        <IoSunnyOutline /> Light
      </Button>

      <Button
        variant="ghost"
        onClick={setDarkTheme}
        className={`${mounted && theme === "dark" ? "text-blue-400" : ""} rounded-lg`}
      >
        <IoMoonOutline /> Dark
      </Button>

      <Button
        variant="ghost"
        onClick={setSystemTheme}
        className={`${mounted && theme === "system" ? "text-blue-400" : ""} rounded-lg`}
      >
        <FaDesktop /> System
      </Button>
    </div>
  );
}
