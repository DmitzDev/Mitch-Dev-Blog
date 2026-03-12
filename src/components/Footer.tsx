import { Github, Twitter, Linkedin, Command } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
              MDev<span className="text-primary">.</span>
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans italic">
              "Architecture is the learned game, correct and magnificent, of forms assembled in the light."
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-sm" />
                <button className="bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors">Join</button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Follow</h4>
              <div className="flex gap-6">
                <Twitter size={18} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
                <Github size={18} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
                <Linkedin size={18} className="text-slate-400 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <p>© 2026 MDev. BLOG. BUILT WITH PRECISION AND CLARITY.</p>
          <div className="flex gap-8">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

