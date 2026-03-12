import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { Post } from "../../types";
import { Helmet } from "react-helmet-async";
import { Search, Edit, Trash2, ExternalLink, Plus, FileText } from "lucide-react";

export function ManagePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "posts"), 
        where("authorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Manage Posts - MitchDevBlog</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          Manage Posts
        </h1>
        <Link 
          to="/admin/posts/new" 
          className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPosts.length} of {posts.length} posts
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.coverImage && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4 rounded overflow-hidden">
                            <img className="h-10 w-10 object-cover" src={post.coverImage} alt="" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{post.excerpt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link to={`/blog/${post.slug}`} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="View">
                          <ExternalLink size={18} />
                        </Link>
                        <Link to={`/admin/posts/${post.id}/edit`} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <FileText size={48} className="mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg font-medium mb-2">No posts found</p>
            <p className="text-sm mb-6">You haven't created any posts matching your search.</p>
            <Link 
              to="/admin/posts/new" 
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Write a story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
