import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ref, get, push, set, query, orderByChild, equalTo, runTransaction } from "firebase/database";
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
  
  const hasCheckedView = useRef(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!slug) return;
      try {
        const postQuery = query(ref(db, "posts"), orderByChild("slug"), equalTo(slug));
        const snapshot = await get(postQuery);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const postId = Object.keys(data)[0];
          const postData = { ...data[postId], id: postId } as Post;
          setPost(postData);

          // 🛡️ ADVANCED UNIQUE VIEW TRACKING (Account-Based)
          if (!hasCheckedView.current) {
            hasCheckedView.current = true;
            
            if (user) {
              // 1. Kung LOGGED IN, i-check sa Database (True Unique Account Tracking)
              const viewRef = ref(db, `unique_views/${postId}/${user.uid}`);
              const viewSnap = await get(viewRef);
              
              if (!viewSnap.exists()) {
                await runTransaction(ref(db, `posts/${postId}/views`), (curr) => (curr || 0) + 1);
                await set(viewRef, true);
              }
            } else {
              // 2. Kung GUEST, fallback sa LocalStorage (Browser Tracking)
              const storageKey = `g_viewed_${postId}`;
              if (!localStorage.getItem(storageKey)) {
                await runTransaction(ref(db, `posts/${postId}/views`), (curr) => (curr || 0) + 1);
                localStorage.setItem(storageKey, 'true');
              }
            }
          }

          const commentsQuery = query(ref(db, "comments"), orderByChild("postId"), equalTo(postId));
          const commentsSnap = await get(commentsQuery);
          if (commentsSnap.exists()) {
            const raw = commentsSnap.val();
            const list = Object.keys(raw)
              .map(k => ({ ...raw[k], id: k }))
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setComments(list);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
  }, [slug, user]); // React to auth state changes

  const handleLike = async () => {
    if (!user) { alert("Please login to react!"); return; }
    if (!post || liked) return;
    try {
      await runTransaction(ref(db, `posts/${post.id}/likes`), (curr) => (curr || 0) + 1);
      setPost({ ...post, likes: (post.likes || 0) + 1 });
      setLiked(true);
    } catch (e: any) { alert("Action failed."); }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const fallbackName = user.email ? user.email.split('@')[0] : "Anonymous";
      const userName = user.displayName || fallbackName;
      const commentData = { postId: post.id, userId: user.uid, userName, content: newComment.trim(), createdAt: Date.now() };
      const newRef = push(ref(db, "comments"));
      await set(newRef, commentData);
      setComments([{ id: newRef.key!, ...commentData }, ...comments]);
      setNewComment("");
      await runTransaction(ref(db, `posts/${post.id}/comments`), (curr) => (curr || 0) + 1);
    } catch (err) { console.error(err); } finally { setSubmittingComment(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse italic">Reading...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-rose-500">Not found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617]">
      <Helmet><title>{post.title} | MDev.</title></Helmet>
      
      <section className="relative h-[80vh] w-full overflow-hidden">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} src={post.coverImage || "https://picsum.photos/1600/900"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-end justify-start px-8 pb-16 max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-6">
            <span className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-sm">{post.category}</span>
            <h1 className="text-6xl md:text-8xl font-serif font-black text-white leading-[1.1]">{post.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
              <span>{post.authorName}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col lg:flex-row gap-20">
        <div className="lg:w-8/12">
          <article className="prose prose-xl prose-slate dark:prose-invert max-w-none font-serif leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>

          <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={handleLike} className={`flex items-center gap-2 px-8 py-3 rounded-full border transition-all font-black text-xs uppercase tracking-widest ${liked ? 'bg-rose-50 text-rose-500 border-rose-100' : 'hover:bg-slate-50 text-slate-500 border-slate-100'}`}>
              <Heart size={16} className={liked ? "fill-rose-500" : ""} /> {post.likes || 0}
            </button>
          </div>

          <section className="mt-32 space-y-12">
            <h3 className="text-4xl font-serif font-black text-slate-900 dark:text-white">Discussion.</h3>
            {user ? (
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Thoughts..." className="w-full p-8 bg-slate-50 dark:bg-slate-900 border-none rounded-[2rem] focus:ring-2 focus:ring-primary outline-none min-h-[150px]" />
                <button disabled={submittingComment} className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] disabled:opacity-30">Post</button>
              </form>
            ) : (
              <div className="p-12 bg-slate-50 dark:bg-slate-900 rounded-[2rem] text-center"><Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-4 rounded-full font-black uppercase tracking-widest text-[10px]">Sign In to Discuss</Link></div>
            )}
            <div className="space-y-12 mt-20">
              {comments.map((c) => (
                <div key={c.id} className="pb-10 border-b border-slate-50 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4"><span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">{c.userName}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(c.createdAt), 'MMM d')}</span></div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
