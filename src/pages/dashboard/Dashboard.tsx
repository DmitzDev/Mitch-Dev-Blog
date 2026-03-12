import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild, equalTo, limitToLast } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { Post } from "../../types";
import { Helmet } from "react-helmet-async";
import { FileText, Eye, Heart, MessageSquare, Plus, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // FAST QUERY: Order by authorId and filter on server
        const postsQuery = query(ref(db, "posts"), orderByChild("authorId"), equalTo(user.uid));
        const snapshot = await get(postsQuery);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const allPosts: Post[] = Object.keys(data)
            .map(key => ({ ...data[key], id: key }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          setStats({
            totalPosts: allPosts.length,
            totalViews: allPosts.reduce((acc, p) => acc + (p.views || 0), 0),
            totalLikes: allPosts.reduce((acc, p) => acc + (p.likes || 0), 0),
            totalComments: allPosts.reduce((acc, p) => acc + (p.comments || 0), 0)
          });
          setRecentPosts(allPosts.slice(0, 5));
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Helmet><title>Studio Dashboard | MDev.</title></Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white">Studio.</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Welcome back, {user?.displayName || "Creator"}</p>
        </div>
        <Link 
          to="/admin/posts/new" 
          className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-primary/20"
        >
          <Plus size={14} strokeWidth={3} /> New Story
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <StatCard title="Insights" value={stats.totalPosts} icon={<FileText />} color="text-blue-500" delay={0.1} />
        <StatCard title="Views" value={stats.totalViews} icon={<Eye />} color="text-emerald-500" delay={0.2} />
        <StatCard title="Appreciation" value={stats.totalLikes} icon={<Heart />} color="text-rose-500" delay={0.3} />
        <StatCard title="Discussions" value={stats.totalComments} icon={<MessageSquare />} color="text-violet-500" delay={0.4} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Recent Artifacts</h2>
          <Link to="/admin/posts" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View Ledger</Link>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />)}
            </div>
          ) : recentPosts.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-50 dark:border-slate-800">
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Publication</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-10 py-8">
                      <div className="font-serif font-black text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">{post.title}</div>
                      <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{post.category}</div>
                    </td>
                    <td className="px-10 py-8 text-sm font-medium text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-6 text-xs font-black uppercase tracking-widest">
                        <Link to={`/admin/posts/${post.id}/edit`} className="text-slate-400 hover:text-primary transition-colors">Edit</Link>
                        <Link to={`/blog/${post.slug}`} className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1">Live <ArrowUpRight size={12} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <p className="font-serif text-xl text-slate-300 italic">No artifacts published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-none flex items-center gap-6"
    >
      <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
        <p className="text-4xl font-serif font-black text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
