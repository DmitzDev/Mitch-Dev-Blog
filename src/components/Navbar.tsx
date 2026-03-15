import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogIn, LayoutDashboard, LogOut, Search, Bookmark, Plus, Edit3, Eye, Send, ArrowLeft } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isPostEditor = location.pathname.includes('/admin/posts/new') || location.pathname.includes('/edit');
  const [isPreview, setIsPreview] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handlePreviewChange = (e: any) => setIsPreview(e.detail);
    window.addEventListener('studio-preview-state', handlePreviewChange);
    return () => window.removeEventListener('studio-preview-state', handlePreviewChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  const dispatchPublish = () => window.dispatchEvent(new CustomEvent('studio-publish'));
  const togglePreview = (state: boolean) => {
    setIsPreview(state);
    window.dispatchEvent(new CustomEvent('studio-preview-toggle', { detail: state }));
  };

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
      <div className="max-w-7xl mx-auto px-6">
        <div className={`
          flex items-center justify-between px-8 py-4 
          rounded-full border border-white/20 dark:border-slate-800/50
          backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 
          shadow-2xl shadow-slate-200/20 dark:shadow-none
          transition-all duration-500
          ${scrolled ? "mx-4" : "mx-0"}
        `}>
          
          <div className="flex items-center gap-6">
            {isPostEditor ? (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 text-slate-400 hover:text-primary transition-all hover:scale-110"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">MDev<span className="text-primary italic">.</span></span>
              </Link>
            )}
          </div>

          {/* Dynamic Unified Controls */}
          <div className="flex-1 flex items-center justify-end md:justify-between ml-8">
            <div className="hidden md:flex items-center gap-8">
              {isPostEditor ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    {location.pathname.includes('/new') ? "New Artifact" : "Refining Entry"}
                  </span>
                </div>
              ) : (
                navLinks.map((link) => (
                  <Link
                    key={link.name} to={link.path}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-400'}`}
                  >
                    {link.name}
                  </Link>
                ))
              )}
            </div>

            <div className="flex items-center gap-4">
              {isPostEditor && (
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mr-2 animate-in zoom-in-95 duration-500">
                  <button 
                    onClick={() => togglePreview(false)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Edit3 size={12} /> Write
                  </button>
                  <button 
                    onClick={() => togglePreview(true)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 px-4 border-l border-slate-200 dark:border-slate-800 ml-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-slate-400 hover:text-primary transition-colors p-2"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {isPostEditor ? (
                  <button
                    onClick={dispatchPublish}
                    className="bg-primary text-white py-2.5 px-8 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 animate-in slide-in-from-right-4 duration-500"
                  >
                    <Send size={12} /> Publish
                  </button>
                ) : (
                  <AnimatePresence mode="wait">
                    {user ? (
                      <div className="flex items-center gap-4">
                        <Link to="/admin/posts/new" className="hidden lg:flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-full transition-all group">
                          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Write</span>
                        </Link>
                        <Link to="/admin/bookmarks" className="text-slate-400 hover:text-primary transition-all p-2 hidden md:block">
                          <Bookmark size={18} />
                        </Link>
                        <Link to="/admin" className="text-slate-400 hover:text-primary transition-all p-2 hidden md:block">
                          <LayoutDashboard size={18} />
                        </Link>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="relative group focus:outline-none"
                          >
                            <img 
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                              className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${isProfileOpen ? 'border-primary ring-4 ring-primary/10' : 'border-primary/20 group-hover:border-primary/50'}`} 
                              alt="Profile" 
                            />
                            {isProfileOpen && (
                              <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                            )}
                          </button>

                          <AnimatePresence>
                            {isProfileOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-3xl overflow-hidden z-50 p-2"
                              >
                                <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50 mb-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated as</p>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                  <Link 
                                    to="/admin" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-6 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                  >
                                    <LayoutDashboard size={14} /> Studio Dashboard
                                  </Link>
                                  <Link 
                                    to="/admin/bookmarks" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-6 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                  >
                                    <Bookmark size={14} /> Saved Artifacts
                                  </Link>
                                  <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all mt-2 border-t border-slate-50 dark:border-slate-800/50 pt-3"
                                  >
                                    <LogOut size={14} /> Log Out
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ) : (
                      <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                        Sign In
                      </Link>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          <button className="md:hidden text-slate-900 dark:text-white ml-4" onClick={() => setIsOpen(!isOpen)}>
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
            {user ? (
              <>
                <Link to="/admin/posts/new" onClick={() => setIsOpen(false)} className="text-xl font-serif font-black text-primary italic">
                  + New Artifact
                </Link>
                <Link to="/admin/bookmarks" onClick={() => setIsOpen(false)} className="text-xl font-serif font-black text-slate-900 dark:text-white">
                  Vault
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="bg-rose-500 text-white py-4 rounded-full font-black uppercase tracking-widest text-[10px]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-primary text-white py-4 rounded-full font-black uppercase tracking-widest text-[10px]">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
