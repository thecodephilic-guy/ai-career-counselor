import { useState } from "react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(false);  

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      setIsDark(false);
    } else {
      setTheme("dark");
      setIsDark(true);
    }
  };
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-transform duration-300 hover:rotate-12"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
