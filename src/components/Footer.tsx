import { Github, Facebook, Music2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
              MDev<span className="text-primary">.</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans italic max-w-xs">
              "Architecture is the learned game, correct and magnificent, of forms assembled in the light."
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-8 items-center">
            <div className="hidden sm:flex items-center gap-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary rounded-sm w-32" />
                <button className="bg-primary text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors">Join</button>
              </div>
            </div>
            
            <div className="flex gap-5">
              <a href="https://www.facebook.com/im.itch14" target="_blank" rel="noopener noreferrer" title="Facebook">
                <Facebook size={14} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
              </a>
              <a href="https://www.tiktok.com/@fosaken.plays" target="_blank" rel="noopener noreferrer" title="TikTok">
                <Music2 size={14} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
              </a>
              <a href="https://github.com/DmitzDev" target="_blank" rel="noopener noreferrer" title="GitHub">
                <Github size={14} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <p>© 2026 MDev. BUILT WITH PRECISION.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary cursor-pointer transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary cursor-pointer transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

