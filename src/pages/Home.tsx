import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Post } from "../types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ChevronRight, Zap, Globe, Shield, Star } from "lucide-react";

// Lazy load the 3D component to keep initial load fast
const ThreeHero = lazy(() => import("../components/ThreeHero"));

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("publishedAt", "desc"), limit(6));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center font-serif text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617]">
      <Helmet>
        <title>MDev. | Modern Development & Design</title>
      </Helmet>

      {/* Featured Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {featuredPost && (
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-7/12 relative group overflow-hidden rounded-2xl">
              <Link to={`/blog/${featuredPost.slug}`}>
                <img
                  src={featuredPost.coverImage || "https://images.unsplash.com/photo-1487958449913-d92799018b39?auto=format&fit=crop&q=80&w=1600"}
                  alt={featuredPost.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-8 left-8">
                  <span className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm">
                    FEATURED
                  </span>
                </div>
              </Link>
            </div>
            <div className="lg:w-5/12 space-y-8">
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black leading-[1.05] text-slate-900 dark:text-white transition-colors group-hover:text-primary">
                  {featuredPost.title}
                </h1>
              </Link>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-sans leading-relaxed line-clamp-3">
                {featuredPost.excerpt || "Discover how simplicity is shaping the buildings of tomorrow. From sustainable materials to the philosophy of 'less is more', explore the evolving urban landscape."}
              </p>
              <div className="flex items-center gap-8 pt-4">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="bg-primary text-white px-10 py-4 rounded-sm text-sm font-bold flex items-center gap-3 hover:bg-primary-dark transition-all"
                >
                  Read Article <ArrowRight size={16} />
                </Link>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{Math.ceil(featuredPost.content.length / 1000)} min read</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Recent Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white">Recent Articles</h2>
          <Link to="/blog" className="text-sm font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {recentPosts.map((post) => (
            <article key={post.id} className="space-y-6 group">
              <Link to={`/blog/${post.slug}`} className="block aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src={post.coverImage || `https://picsum.photos/seed/${post.id}/800/600`}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </Link>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <span>{post.category}</span>
                  <span className="text-slate-200 dark:text-slate-700">|</span>
                  <span className="text-slate-400">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-2xl font-serif font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination mock (from image) */}
        <div className="flex items-center justify-center gap-4 mt-24">
          <button className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-colors disabled:opacity-30"><ChevronRight className="rotate-180" size={16} /></button>
          <button className="w-10 h-10 bg-primary text-white rounded-md flex items-center justify-center text-sm font-bold">1</button>
          <button className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center text-sm font-bold text-slate-500 hover:border-primary transition-colors">2</button>
          <button className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center text-sm font-bold text-slate-500 hover:border-primary transition-colors">3</button>
          <span className="text-slate-300">...</span>
          <button className="w-10 h-10 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center text-slate-400 hover:text-primary transition-colors"><ChevronRight size={16} /></button>
        </div>
      </section>

      {/* Footer Branding Section (from image 3 style) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 mt-24 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
          <span className="text-4xl font-serif font-black text-slate-900 dark:text-white uppercase mb-8">MDev.</span>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-12 italic">
            "The architecture of the future will be more human, more intuitive, and more connected to the world around us. We are here to document that transition."
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">© 2026 MDev. Blog. Built with precision and clarity.</p>
        </div>
      </section>
    </div>
  );
}

