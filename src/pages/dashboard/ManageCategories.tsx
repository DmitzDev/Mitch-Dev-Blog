import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, set, remove, push } from "firebase/database";
import { db } from "../../firebase/config";
import { Helmet } from "react-helmet-async";
import { Plus, Trash2, ArrowLeft, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManageCategories() {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catsRef = ref(db, "categories");
        const snapshot = await get(catsRef);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          setCategories(Object.keys(raw).map(k => ({ id: k, name: raw[k].name })));
        } else {
          // Default categories requested by USER
          const defaults = ['Technology', 'Programming', 'Travel', 'Lifestyle', 'Gaming'];
          const list = [];
          for (const name of defaults) {
            const newRef = push(ref(db, "categories"));
            await set(newRef, { name });
            list.push({ id: newRef.key!, name });
          }
          setCategories(list);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchCats();
  }, []);

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    try {
      const newRef = push(ref(db, "categories"));
      await set(newRef, { name: newCat.trim() });
      setCategories([...categories, { id: newRef.key!, name: newCat.trim() }]);
      setNewCat("");
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Classification termination protocol: Permanently redact this identity?")) return;
    try {
      await remove(ref(db, `categories/${id}`));
      setCategories(categories.filter(c => c.id !== id));
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <Helmet><title>Taxonomy | MDev Vault</title></Helmet>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-20 space-y-4">
        <Link to="/admin" className="text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-8"><ArrowLeft size={14} /> Back to Vault</Link>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Class Ledger Custodian</span>
        <h1 className="text-7xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">Classes.</h1>
      </motion.div>

      <div className="premium-card p-12 space-y-12 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newCat} 
            onChange={(e) => setNewCat(e.target.value)} 
            placeholder="New Class Identity..." 
            className="flex-1 bg-white dark:bg-slate-900 rounded-3xl px-8 py-5 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-xs shadow-sm transition-all text-slate-900 dark:text-white" 
          />
          <button onClick={handleAdd} className="btn-primary-shimmer px-10 py-5 flex items-center gap-3"><Plus size={16} strokeWidth={3} /> Register Class</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {categories.map((c, i) => (
              <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={c.id} className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-6">
                  <span className="text-4xl font-serif font-black text-slate-100 dark:text-slate-800">0{i+1}</span>
                  <div className="space-y-1">
                    <div className="text-xl font-serif font-black text-slate-900 dark:text-white flex items-center gap-3">{c.name} <Star size={10} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Identity ID: {c.id.substring(0, 8)}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="w-12 h-12 rounded-full text-slate-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
