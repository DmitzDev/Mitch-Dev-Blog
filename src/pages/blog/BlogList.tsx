import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild } from "firebase/database";
import { db } from "../../firebase/config";
import { Post } from "../../types";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Search, ArrowRight, Filter, Sparkles, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchPostsAndCats = async () => {
      try {
        const postsRef = query(ref(db, "posts"), orderByChild("publishedAt"));
        const snapshot = await get(postsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPosts(Object.keys(data).map(k => ({ ...data[k], id: k })).reverse());
        }

        const catsRef = ref(db, "categories");
        const catsSnap = await get(catsRef);
        if (catsSnap.exists()) {
          const raw = catsSnap.val();
          setCategories(["All", ...Object.values(raw).map((c: any) => c.name)]);
        } else {
          setCategories(["All", "Technology", "Programming", "Travel", "Lifestyle", "Gaming"]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchPostsAndCats();
  }, []);

  const [categories, setCategories] = useState<string[]>(["All"]);
  const filtered = posts.filter(p => {
    const mCat = selectedCategory === "All" || p.category === selectedCategory;
    const mSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return mCat && mSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] py-32">
      <Helmet><title>Archives | MDev Studio</title></Helmet>
      
      <div className="max-w-7xl mx-auto px-8">
        <header className="mb-32 space-y-16">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl space-y-8"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary flex items-center gap-3">
                <Sparkles size={14} /> The Knowledge Ledger
              </span>
              <h1 className="text-8xl md:text-[10rem] font-serif font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter">
                Archive<span className="text-primary italic">.</span>
              </h1>
              <p className="text-2xl text-slate-400 font-medium italic border-l-4 border-slate-50 dark:border-slate-800/50 pl-10 max-w-xl">
                "A chronological repository of digital artifacts and architectural musings."
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-[450px] space-y-8"
            >
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors" size={20} />
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-transparent focus:border-primary/20 outline-none transition-all text-sm font-bold shadow-2xl shadow-slate-200/50 dark:shadow-none"
                  placeholder="Query Archetypes..."
                />
              </div>
              
              <div className="flex justify-between items-center px-4">
                <div className="flex gap-2">
                   <button onClick={() => setViewMode('grid')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:text-primary'}`}>
                      <LayoutGrid size={18} />
                   </button>
                   <button onClick={() => setViewMode('list')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:text-primary'}`}>
                      <List size={18} />
                   </button>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <Filter size={12} /> {filtered.length} SELECTIONS
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-3 pt-8">
            {categories.map(c => (
              <button 
                key={c} onClick={() => setSelectedCategory(c)}
                className={`btn-premium px-8 py-3 rounded-full text-[9px] font-black text-center uppercase tracking-widest border transition-all ${selectedCategory === c ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary hover:text-primary'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24" : "space-y-12 max-w-4xl"}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((post) => (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={post.id} 
                  className={`group relative ${viewMode === 'list' ? 'flex gap-12 items-center italic pb-12 border-b border-slate-50 dark:border-slate-800' : ''}`}
                >
                  <Link to={`/blog/${post.slug}`} className={`block overflow-hidden rounded-[3rem] shadow-2xl relative ${viewMode === 'grid' ? 'aspect-square mb-10' : 'w-48 h-48 flex-shrink-0'}`}>
                    <img src={post.coverImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-500" />
                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Read Abstract</span>
                       <ArrowRight className="text-white" size={16} />
                    </div>
                  </Link>

                  <div className="space-y-4 px-2">
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-primary">
                      <span>{post.category}</span>
                      <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest">{format(new Date(post.publishedAt), 'MMM dd')}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className={`font-serif font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors hover:underline hover:decoration-primary/20 underline-offset-8 ${viewMode === 'grid' ? 'text-4xl' : 'text-5xl'}`}>
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-slate-400 text-lg leading-relaxed line-clamp-2 italic font-serif opacity-80 group-hover:opacity-100 transition-opacity">"{post.excerpt}"</p>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
