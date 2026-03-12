import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { Post } from "../../types";
import { Helmet } from "react-helmet-async";
import { FileText, Eye, Heart, MessageSquare, Plus } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "posts"), 
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
        
        setStats({
          totalPosts: posts.length,
          totalViews: posts.reduce((acc, post) => acc + (post.views || 0), 0),
          totalLikes: posts.reduce((acc, post) => acc + (post.likes || 0), 0),
          totalComments: posts.reduce((acc, post) => acc + (post.comments || 0), 0)
        });

        setRecentPosts(posts.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard - MitchDevBlog</title>
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <Link 
          to="/admin/posts/new" 
          className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<FileText size={24} />} title="Total Posts" value={stats.totalPosts} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
          <StatCard icon={<Eye size={24} />} title="Total Views" value={stats.totalViews} color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" />
          <StatCard icon={<Heart size={24} />} title="Total Likes" value={stats.totalLikes} color="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" />
          <StatCard icon={<MessageSquare size={24} />} title="Comments" value={stats.totalComments} color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Recent Posts</h2>
          <Link to="/admin/posts" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{post.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/posts/${post.id}/edit`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Edit</Link>
                      <Link to={`/blog/${post.slug}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            You haven't published any posts yet.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number, color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
