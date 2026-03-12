import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, remove, query, limitToLast } from "firebase/database";
import { db } from "../../firebase/config";
import { Comment } from "../../types";
import { Helmet } from "react-helmet-async";
import { Trash2, MessageSquare, ArrowLeft, User, Calendar, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export function ManageComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = query(ref(db, "comments"), limitToLast(200));
        const snapshot = await get(commentsRef);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          const list = Object.keys(raw)
            .map(k => ({ ...raw[k], id: k }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setComments(list);
        }
      } catch (e) {
        console.error("Moderation vault sync failure:", e);
      }
      setLoading(false);
    };
    fetchComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Discussion termination protocol: Permanently redact this entry?")) return;
    try {
      await remove(ref(db, `comments/${id}`));
      setComments(comments.filter(c => c.id !== id));
    } catch (e) {
      alert("Redaction failed: Ledger rejection.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-24">
      <Helmet><title>Moderation Vault | MDev Studio</title></Helmet>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-20 space-y-4">
        <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-8"><ArrowLeft size={14} /> Back to Vault</Link>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Global Discussion Moderation</span>
        <h1 className="text-7xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">Discussions.</h1>
      </motion.div>

      <div className="space-y-8">
        <AnimatePresence>
          {comments.length > 0 ? comments.map((c, i) => (
            <motion.div 
               layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 100 }}
               key={c.id} className="premium-card p-10 hover:border-primary/20 transition-all border border-slate-100 dark:border-slate-800/10 flex flex-col md:flex-row gap-12 items-start md:items-center group"
            >
               <div className="w-16 h-16 rounded-full glass shrink-0 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all"><MessageSquare size={24} /></div>
               
               <div className="space-y-4 flex-1">
                 <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-3"><User size={12} className="text-primary" /><span className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">{c.userName}</span></div>
                    <div className="flex items-center gap-3"><Calendar size={12} className="text-slate-300" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{c.createdAt ? format(new Date(c.createdAt), 'MMM dd, yyyy · HH:mm') : 'Unknown Date'}</span></div>
                 </div>
                 <p className="text-2xl font-serif italic text-slate-500 dark:text-slate-400 leading-relaxed pr-12 line-clamp-2 hover:line-clamp-none transition-all cursor-crosshair">"{c.content}"</p>
               </div>

               <div className="flex gap-4 md:border-l border-slate-50 dark:border-slate-800/50 md:pl-12 self-stretch items-center">
                  <button onClick={() => handleDelete(c.id)} className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"><Trash2 size={20} /></button>
               </div>
            </motion.div>
          )) : (
            <div className="text-center p-32 premium-card border-dashed border-2">
              <p className="text-3xl font-serif italic text-slate-300 uppercase tracking-tighter">No discussions detected in the global ledger.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
