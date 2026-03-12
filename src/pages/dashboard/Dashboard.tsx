import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { Post } from "../../types";
import { Helmet } from "react-helmet-async";
import { FileText, Eye, Heart, MessageSquare, Plus, ArrowUpRight, ArrowRight } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-8 py-24">
      <Helmet><title>Dashboard | MDev Studio</title></Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary bg-primary/5 px-4 py-2 rounded-full mb-6 inline-block">Control Center</span>
          <h1 className="text-7xl font-serif font-black text-slate-900 dark:text-white leading-none">Studio.</h1>
          <p className="text-slate-400 mt-6 font-medium italic text-lg opacity-80">Refining your creative output, {user?.displayName || "Director"}.</p>
        </motion.div>
        
        <Link to="/admin/posts/new" className="btn-primary-shimmer group py-5 px-12">
          <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> Start New Entry
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        <StatCard title="Artifacts" value={stats.totalPosts} icon={<FileText size={20} />} color="text-indigo-500" bg="bg-indigo-50/50 dark:bg-indigo-500/10" delay={0.1} />
        <StatCard title="Views" value={stats.totalViews} icon={<Eye size={20} />} color="text-emerald-500" bg="bg-emerald-50/50 dark:bg-emerald-500/10" delay={0.2} />
        <StatCard title="Appreciation" value={stats.totalLikes} icon={<Heart size={20} />} color="text-rose-500" bg="bg-rose-50/50 dark:bg-rose-500/10" delay={0.3} />
        <StatCard title="Discussions" value={stats.totalComments} icon={<MessageSquare size={20} />} color="text-violet-500" bg="bg-violet-50/50 dark:bg-violet-500/10" delay={0.4} />
      </div>

      {/* Recent Ledger */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="premium-card overflow-hidden group/card"
      >
        <div className="px-12 py-10 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-3xl font-serif font-black text-slate-900 dark:text-white">Recent Ledger</h2>
          <Link to="/admin/posts" className="btn-ghost flex items-center gap-2 group/btn">
            View Archives <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 space-y-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem]" />)}
            </div>
          ) : recentPosts.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-50 dark:border-slate-800/50">
                  <th className="px-12 py-8 font-black">Identity</th>
                  <th className="px-12 py-8 font-black">Metric</th>
                  <th className="px-12 py-8 font-black">Timeline</th>
                  <th className="px-12 py-8 font-black text-right">Utility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="group/row hover:bg-slate-50/80 dark:hover:bg-slate-900 transition-all duration-300">
                    <td className="px-12 py-10">
                      <div className="font-serif font-black text-xl text-slate-900 dark:text-white group-hover/row:text-primary transition-colors">{post.title}</div>
                      <div className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em] bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1 rounded-full">{post.category}</div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2 text-slate-400"><Eye size={12} /> <span className="text-xs font-bold">{post.views || 0}</span></div>
                        <div className="flex items-center gap-2 text-slate-400"><Heart size={12} /> <span className="text-xs font-bold">{post.likes || 0}</span></div>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-xs font-bold text-slate-400 tracking-widest uppercase italic">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/admin/posts/${post.id}/edit`} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm">
                           <FileText size={16} />
                        </Link>
                        <Link to={`/blog/${post.slug}`} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-500 shadow-sm">
                           <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-32 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-slate-800">
                <FileText className="text-slate-200 dark:text-slate-800" size={40} />
              </div>
              <p className="font-serif text-3xl font-black text-slate-300 dark:text-slate-800 italic">No artifacts published.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800/10 shadow-editorial hover:shadow-editorial-hover transition-all duration-500 group"
    >
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">{title}</p>
        <p className="text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
