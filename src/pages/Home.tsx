import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "../firebase/config";
import { Post } from "../types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ChevronRight } from "lucide-react";

// Lazy load the 3D component
const ThreeHero = lazy(() => import("../components/ThreeHero"));

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(ref(db, "posts"), orderByChild("publishedAt"), limitToLast(6));
        const snapshot = await get(postsQuery);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data)
            .map(k => ({ ...data[k], id: k }))
            .sort((a, b) => b.publishedAt - a.publishedAt);
          setPosts(list);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const featured = posts[0];
  const recent = posts.slice(1);

  if (loading) return <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center font-serif text-3xl animate-pulse italic">MDev.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617]">
      <Helmet><title>MDev. | Modern Development & Design</title></Helmet>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 md:py-32">
        {featured && (
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="lg:w-1/2 space-y-10"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary bg-primary/5 px-4 py-2 rounded-full">New Artifact</span>
              <Link to={`/blog/${featured.slug}`} className="block group">
                <h1 className="text-7xl md:text-9xl font-serif font-black leading-[0.95] text-slate-900 dark:text-white transition-colors group-hover:text-primary">
                  {featured.title}
                </h1>
              </Link>
              <p className="text-2xl text-slate-400 font-medium italic leading-relaxed max-w-xl">
                "{featured.excerpt}"
              </p>
              <Link to={`/blog/${featured.slug}`} className="inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-2xl shadow-slate-200">
                Read Abstract <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
              className="lg:w-1/2 relative group"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[4rem]">
                <img 
                  src={featured.coverImage || "https://picsum.photos/800/1000"} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
            </motion.div>
          </div>
        )}
      </section>

      {/* Recent Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t border-slate-50 dark:border-slate-800">
        <div className="flex justify-between items-end mb-24">
          <h2 className="text-6xl font-serif font-black text-slate-900 dark:text-white leading-none">Journal.</h2>
          <Link to="/blog" className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 hover:gap-4 transition-all pb-1 border-b-2 border-primary/20">
            Explorer Index <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {recent.map((post) => (
            <article key={post.id} className="group space-y-8">
              <Link to={`/blog/${post.slug}`} className="block aspect-square overflow-hidden rounded-[3rem]">
                <img 
                  src={post.coverImage || `https://picsum.photos/seed/${post.id}/800`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </Link>
              <div className="space-y-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{post.category}</span>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic font-serif">"{post.excerpt}"</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-32 bg-slate-50 dark:bg-slate-900/50 text-center">
        <div className="max-w-4xl mx-auto px-8">
          <span className="text-5xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-tighter">MDev.</span>
          <p className="mt-10 text-slate-400 font-medium italic leading-relaxed max-w-2xl mx-auto">
            The intersection of precision code and timeless architecture. Documenting the transition to a more human, intuitive world.
          </p>
          <div className="mt-16 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">© 2026 MDev. Precision Design.</div>
        </div>
      </footer>
    </div>
  );
}
