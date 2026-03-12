import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild } from "firebase/database";
import { db } from "../../firebase/config";
import { Post } from "../../types";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Search, ArrowRight } from "lucide-react";

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(ref(db, "posts"), orderByChild("publishedAt"));
        const snapshot = await get(postsQuery);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data)
            .map(k => ({ ...data[k], id: k }))
            .reverse(); // Newest first
          setPosts(list);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchPosts();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];
  const filtered = posts.filter(p => {
    const mCat = selectedCategory === "All" || p.category === selectedCategory;
    const mSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return mCat && mSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] py-32 px-8">
      <Helmet><title>Stories | MDev.</title></Helmet>
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-2xl">
            <h1 className="text-7xl md:text-9xl font-serif font-black text-slate-900 dark:text-white leading-[0.9]">Ledger.</h1>
            <p className="mt-8 text-xl text-slate-400 font-medium italic">Documenting the architecture of modern life and design.</p>
          </div>
          <div className="w-full md:w-[400px] relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-full border-none outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-bold"
              placeholder="Search Archives..."
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-20">
          {categories.map(c => (
            <button 
              key={c} onClick={() => setSelectedCategory(c)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[16/9] bg-slate-50 dark:bg-slate-900 rounded-[3rem]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {filtered.map((post) => (
              <article key={post.id} className="group">
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-[3rem] mb-8">
                  <img 
                    src={post.coverImage || "https://picsum.photos/800/600"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </Link>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    <span>{post.category}</span>
                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <span className="text-slate-400">{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-4xl font-serif font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors underline-offset-8 group-hover:underline">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed line-clamp-2 italic font-serif opacity-80 group-hover:opacity-100 transition-opacity">"{post.excerpt}"</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
