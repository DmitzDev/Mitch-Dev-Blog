import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, remove } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { Helmet } from "react-helmet-async";
import { Bookmark, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManageBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const bRef = ref(db, `bookmarks/${user.uid}`);
        const snapshot = await get(bRef);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          setBookmarks(Object.keys(raw).map(k => ({ ...raw[k], id: k })));
        }
      } catch (e) {
        console.error("Vault retrieval failure:", e);
      }
      setLoading(false);
    };
    fetchBookmarks();
  }, [user]);

  const removeBookmark = async (id: string) => {
    if (!user) return;
    try {
      await remove(ref(db, `bookmarks/${user.uid}/${id}`));
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (e) {
      alert("Removal failed: Ledger rejection.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-24">
      <Helmet><title>Saved Archives | MDev Studio</title></Helmet>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-24 space-y-4">
        <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-8"><ArrowLeft size={14} /> Back to Studio</Link>
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Personal Manuscript Vault</span>
        <h1 className="text-8xl font-serif font-black text-slate-900 dark:text-white tracking-tighter italic">Saved.</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <AnimatePresence>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] animate-pulse" />)
          ) : bookmarks.length > 0 ? bookmarks.map((b) => (
            <motion.div
              layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              key={b.id} className="premium-card group relative flex flex-col h-full bg-white dark:bg-slate-900/50"
            >
              <Link to={`/blog/${b.slug}`} className="block relative aspect-video overflow-hidden rounded-[2rem] m-4">
                <img src={b.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              </Link>
              <div className="p-8 flex-1 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{b.category}</span>
                <Link to={`/blog/${b.slug}`}>
                  <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight italic line-clamp-2">"{b.title}"</h3>
                </Link>
              </div>
              <div className="p-8 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <Link to={`/blog/${b.slug}`} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                  Access Manuscript <ExternalLink size={12} />
                </Link>
                <button onClick={() => removeBookmark(b.id)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-48 text-center premium-card border-dashed">
              <Bookmark className="mx-auto text-slate-100 dark:text-slate-800 mb-8" size={60} />
              <p className="font-serif text-3xl font-black text-slate-300 dark:text-slate-800 italic">No manuscripts in saved vault.</p>
              <Link to="/blog" className="btn-ghost mt-8 inline-flex">Explore Archives</Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
