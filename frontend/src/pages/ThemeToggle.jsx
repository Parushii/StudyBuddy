import { useTheme } from "../context/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        px-4 py-2 rounded-xl text-sm
        text-black dark:text-white
        border border-black/10 dark:border-white/20
        bg-white dark:bg-black
        hover:scale-105 transition
      "
    >
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
