import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "../firebase/config";
import { Post } from "../types";
import { format } from "date-fns";
import { motion, useScroll, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ChevronRight, Zap, Globe, Shield, Star, MousePointer2 } from "lucide-react";

const ThreeHero = lazy(() => import("../components/ThreeHero"));

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(ref(db, "posts"), orderByChild("publishedAt"), limitToLast(6));
        const snapshot = await get(postsQuery);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data)
            .map(k => ({ ...data[k], id: k }));
          
          setPosts([...list].sort((a, b) => b.publishedAt - a.publishedAt));
          setTrending([...list].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4));
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const featured = posts[0];
  const recent = posts.slice(1);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-serif font-black italic tracking-tighter">MDev.</motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] selection:bg-primary selection:text-white">
      <Helmet><title>MDev. | The Nexus of Design & Code</title></Helmet>

      {/* Hero Section with 3D particles */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-slate-50 dark:border-slate-800/50">
        <Suspense fallback={null}>
          <ThreeHero />
        </Suspense>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-[#020617]/50 dark:to-[#020617] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="space-y-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/60 dark:text-primary/40">Established MMXXVI</span>
            <h1 className="text-8xl md:text-[12rem] font-serif font-black leading-[0.85] tracking-tighter text-slate-900 dark:text-white">
              Studio<span className="text-primary italic">.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl text-slate-400 font-medium italic max-w-2xl mx-auto"
          >
            "The intersection of minimalist architecture and liquid code."
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
            className="pt-12"
          >
            <Link to="/blog" className="group relative inline-flex items-center gap-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-16 py-6 rounded-full text-xs font-black uppercase tracking-[0.3em] overflow-hidden">
              <span className="relative z-10">Access Archives</span>
              <ArrowRight className="group-hover:translate-x-3 transition-transform relative z-10" size={18} />
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
          </motion.div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <MousePointer2 size={24} />
        </div>
      </section>

      {/* Featured Insight */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="lg:col-span-5 space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary">Current Abstract</span>
                <Link to={`/blog/${featured.slug}`} className="block group">
                  <h2 className="text-6xl md:text-8xl font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-[0.95]">
                    {featured.title}
                  </h2>
                </Link>
              </div>
              <p className="text-xl text-slate-500 leading-relaxed font-serif italic border-l-4 border-slate-100 dark:border-slate-800 pl-8">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-6">
                <Link to={`/blog/${featured.slug}`} className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-primary transition-colors underline underline-offset-8 decoration-2 decoration-primary/20">Read Full Story</Link>
                <span className="w-10 h-[1px] bg-slate-100 dark:bg-slate-800" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{format(new Date(featured.publishedAt), 'MMMM yyyy')}</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="lg:col-span-7 relative"
            >
              <Link to={`/blog/${featured.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-[3rem] shadow-2xl">
                <img src={featured.coverImage} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[3rem]" />
              </Link>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          </div>
        )}
      </section>

      {/* Trending Ledger */}
      {trending.length > 0 && (
        <section className="py-24 border-y border-slate-50 dark:border-slate-800/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 flex items-center gap-16 overflow-x-auto no-scrollbar pb-8">
            <div className="shrink-0 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Velocity</span>
              <h2 className="text-4xl font-serif font-black italic">Trending.</h2>
            </div>
            {trending.map((tp, idx) => (
              <Link key={tp.id} to={`/blog/${tp.slug}`} className="flex items-center gap-8 shrink-0 group">
                <span className="text-6xl font-serif font-black text-slate-100 dark:text-slate-800/50">0{idx + 1}</span>
                <div className="space-y-1 max-w-[200px]">
                  <h4 className="font-serif font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors italic">"{tp.title}"</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{tp.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Grid of Journal Entries */}
      <section className="py-32 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-24">
            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Library</span>
              <h2 className="text-5xl font-serif font-black text-slate-900 dark:text-white">Recent Artifacts.</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {recent.map((post, idx) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group flex flex-col"
              >
                <Link to={`/blog/${post.slug}`} className="block aspect-square overflow-hidden rounded-[2.5rem] mb-8 relative">
                  <img src={post.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </Link>
                <div className="space-y-4 px-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">{post.category}</span>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-slate-400 text-sm line-clamp-2 italic font-serif">"{post.excerpt}"</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-32 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h2 className="text-8xl font-serif font-black text-slate-900 dark:text-white opacity-10 mb-[-1.5rem]">MDEV STUDIO</h2>
          <div className="space-y-8">
            <p className="text-slate-500 font-medium italic leading-relaxed max-w-xl mx-auto">
              "Dedicated to the fine art of system architecture and digital storytelling."
            </p>
            <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Philippines — 2026</span>
            </div>
          </div>
        </div>
      </footer >
    </div>
  );
}
