import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Post, Comment } from "../../types";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart, Share2, MessageCircle, Bookmark, ArrowLeft, Clock, User, Tag, Calendar } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!slug) return;

      try {
        const q = query(collection(db, "posts"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const postData = { id: docData.id, ...docData.data() } as Post;
          setPost(postData);

          const commentsQuery = query(
            collection(db, "comments"),
            where("postId", "==", postData.id),
            orderBy("createdAt", "desc")
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = commentsSnapshot.docs.map(c => ({ id: c.id, ...c.data() })) as Comment[];
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  const handleLike = async () => {
    if (!post || liked) return;

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, { likes: increment(1) });
      setPost({ ...post, likes: (post.likes || 0) + 1 });
      setLiked(true);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const commentData = {
        postId: post.id,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        content: newComment.trim(),
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, "comments"), commentData);
      setComments([{ id: docRef.id, ...commentData }, ...comments]);
      setNewComment("");

      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        comments: increment(1)
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Loading Article...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-red-500">Post not found</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617]">
      <Helmet>
        <title>{post.title} | MDev.</title>
      </Helmet>

      {/* Hero Header */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={post.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="max-w-4xl text-center space-y-8">
            <span className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-sm">
              {post.category}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <div className="lg:w-8/12">
            <div className="flex items-center gap-6 mb-16 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <h4 className="font-serif font-black text-lg text-slate-900 dark:text-white">{post.authorName}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(post.publishedAt), 'MMMM d, yyyy')} • {Math.ceil(post.content.length / 1000)} min read</p>
              </div>
            </div>

            <article className="prose prose-xl dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Interaction Buttons */}
            <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 font-bold px-6 py-3 rounded-full border transition-all ${liked ? 'bg-red-50 text-red-500 border-red-100' : 'hover:bg-slate-50 text-slate-600 border-slate-200 dark:border-slate-800'}`}
                >
                  <Heart size={20} className={liked ? "fill-red-500" : ""} /> {post.likes || 0}
                </button>
                <button className="flex items-center gap-2 font-bold px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 transition-all">
                  <Share2 size={20} /> Share
                </button>
              </div>
              <Bookmark size={24} className="text-slate-400 cursor-pointer hover:text-primary transition-colors" />
            </div>

            {/* Comments */}
            <section className="mt-32 space-y-12">
              <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white">Discussion ({comments.length})</h3>

              {user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment..."
                    className="w-full p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary min-h-[150px]"
                  />
                  <button
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-primary text-white px-10 py-3 rounded-full font-bold transition-all disabled:opacity-50"
                  >
                    Post Comment
                  </button>
                </form>
              ) : (
                <div className="p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center">
                  <p className="font-serif text-xl mb-6">Sign in to join the conversation</p>
                  <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold">Login</Link>
                </div>
              )}

              <div className="space-y-8 mt-16">
                {comments.map((comment) => (
                  <div key={comment.id} className="pb-8 border-b border-slate-50 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                      <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-4/12 space-y-16">
            <div className="bg-primary p-12 rounded-2xl text-white space-y-8">
              <h3 className="text-2xl font-serif font-black">Newsletter</h3>
              <p className="text-primary-100 leading-relaxed">Get the latest architectural insights delivered directly to your inbox every week.</p>
              <input type="email" placeholder="Email address" className="w-full bg-white/10 border border-white/20 rounded-lg px-6 py-4 placeholder:text-white/50 focus:outline-none" />
              <button className="w-full bg-white text-primary py-4 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-colors">Subscribe Now</button>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-serif font-black border-b border-slate-100 pb-4">Related Posts</h3>
              <div className="space-y-10">
                {/* Related posts logic would go here, using category matches or random */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-6 items-center group cursor-pointer">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100">
                      <img src={`https://picsum.photos/seed/rel${i}/200`} alt="related" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-serif font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">Minimalism: More Than Just an Aesthetic</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">5 MIN READ • OCT 8</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-serif font-black mb-6">Topics</h3>
              <div className="space-y-4">
                {[
                  { name: 'Architecture', count: 12 },
                  { name: 'Urbanism', count: 8 },
                  { name: 'Design', count: 24 },
                  { name: 'Sustainability', count: 18 },
                ].map((topic) => (
                  <div key={topic.name} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 hover:text-primary cursor-pointer transition-colors flex items-center gap-2">
                      <Tag size={14} /> {topic.name}
                    </span>
                    <span className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded text-[10px] font-black">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

