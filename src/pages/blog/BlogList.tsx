import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Post } from "../../types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Search, Filter, Calendar, Folder, Star, ArrowRight } from "lucide-react";

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("publishedAt", "desc"));
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

  const categories = ["All", ...Array.from(new Set(posts.map(post => post.category)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] py-20 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Insights & Stories | MDev.</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <header className="mb-20 space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white">Insights & Stories</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-sans max-w-2xl">
            Exploring the intersection of modern design, urban architecture, and the human experience.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filters & Search side panel */}
          <aside className="lg:w-1/4 space-y-12">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Search</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Find articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Categories</h3>
              <div className="flex flex-col gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-left text-sm font-bold transition-all ${selectedCategory === category ? "text-primary pl-4 border-l-2 border-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="group space-y-6">
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
                        <span className="text-slate-200 dark:text-slate-800">|</span>
                        <span className="text-slate-400">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic font-serif">
                        "{post.excerpt}"
                      </p>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white hover:text-primary transition-colors"
                      >
                        Read Post <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && filteredPosts.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="font-serif text-2xl text-slate-400">No matching stories found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

