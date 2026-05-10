"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { FaDesktop } from "react-icons/fa";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const options = [
  { value: "light", label: "Light", Icon: IoSunnyOutline },
  { value: "dark", label: "Dark", Icon: IoMoonOutline },
  { value: "system", label: "System", Icon: FaDesktop },
];

export default function SwitchTheme() {
  const { setTheme, theme } = useTheme();
  const mounted = useIsMounted();

  return (
    <div className="flex items-center gap-6 px-4 py-1 justify-center rounded-2xl border border-border">
      {options.map(({ value, label, Icon }) => (
        <Button
          key={value}
          variant="ghost"
          aria-pressed={mounted && theme === value}
          onClick={() => setTheme(value)}
          className={`${mounted && theme === value ? "text-blue-400" : ""} rounded-lg hover:bg-muted`}
        >
          <Icon /> {label}
        </Button>
      ))}
    </div>
  );
}
