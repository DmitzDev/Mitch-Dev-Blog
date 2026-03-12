import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, PenSquare, LogOut, User, Command } from "lucide-react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";

export function Navbar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 dark:bg-slate-950/80 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
                MDev<span className="text-primary">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Home</Link>
            <Link to="/blog" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Insights</Link>
            <Link to="/blog?category=Design" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Design</Link>
            <Link to="/admin" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">About</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-6">
                <Link
                  to="/admin/posts/new"
                  className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary"
                >
                  <PenSquare size={18} />
                  <span>Write</span>
                </Link>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
                <Link to="/admin" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <User size={18} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

