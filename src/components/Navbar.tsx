import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogIn, LayoutDashboard, LogOut, Search } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Archives", path: "/blog" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-4" : "py-8"}`}>
      <div className={`max-w-7xl mx-auto px-6`}>
        <div className={`
          flex items-center justify-between px-8 py-4 
          rounded-full border border-white/20 dark:border-slate-800/50
          backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 
          shadow-2xl shadow-slate-200/20 dark:shadow-none
          transition-all duration-500
          ${scrolled ? "mx-4" : "mx-0"}
        `}>
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">MDev<span className="text-primary italic">.</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link 
                key={link.name} to={link.path} 
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-400'}`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-400 hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <AnimatePresence mode="wait">
                {user ? (
                  <div className="flex items-center gap-6">
                    <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors">
                      <LayoutDashboard size={18} />
                    </Link>
                    <button onClick={logout} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <LogOut size={18} />
                    </button>
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-8 h-8 rounded-full border-2 border-primary/20 ring-2 ring-transparent hover:ring-primary/20 transition-all" alt="Profile" />
                  </div>
                ) : (
                  <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all">
                    Sign In
                  </Link>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button className="md:hidden text-slate-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-24 left-6 right-6 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-3xl md:hidden flex flex-col gap-8 text-center"
          >
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="text-xl font-serif font-black text-slate-900 dark:text-white">
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-primary text-white py-4 rounded-full font-black uppercase tracking-widest text-[10px]">
                Authentication
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
