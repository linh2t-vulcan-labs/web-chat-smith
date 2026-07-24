import { useTheme } from "@wrksz/themes/client";
import React from "react";

import { SvgIcon } from "@/components/svg-icon-ds";

interface Props {
  onThemeChange?: (theme: string) => void;
}

const ThemeToggle: React.FC<Props> = ({ onThemeChange }) => {
  const { setTheme, theme } = useTheme();

  const handleChangeTheme = () => {
    const selectedTheme = theme === "light" ? "dark" : "light";
    setTheme(selectedTheme);
    onThemeChange?.(selectedTheme);
  };

  return (
    <button
      type="button"
      className="cursor-pointer"
      onClick={handleChangeTheme}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      <SvgIcon
        name="moon"
        size={28}
        className="text-v1-text-general-primary block dark:hidden"
      />
      <SvgIcon
        name="sun"
        size={28}
        className="text-v1-text-general-primary hidden dark:block"
      />
    </button>
  );
};

export default ThemeToggle;
