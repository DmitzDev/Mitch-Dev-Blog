import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ref, get, push, set, query, orderByChild, equalTo, runTransaction } from "firebase/database";
import { db } from "../../firebase/config";
import { Post, Comment } from "../../types";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart, Share2, MessageCircle, Bookmark, ArrowLeft, Clock, BookmarkCheck, CornerDownRight, Sparkles } from "lucide-react";
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
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [email, setEmail] = useState("");
  const [submittingNews, setSubmittingNews] = useState(false);
  
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

          if (user) {
            const likedSnap = await get(ref(db, `likes/${postId}/${user.uid}`));
            setLiked(likedSnap.exists());

            const BookSnap = await get(ref(db, `bookmarks/${user.uid}/${postId}`));
            setBookmarked(BookSnap.exists());
          }

          // Fetch Related Posts
          const relatedQuery = query(ref(db, "posts"), orderByChild("category"), equalTo(postData.category));
          const relatedSnap = await get(relatedQuery);
          if (relatedSnap.exists()) {
            const rData = relatedSnap.val();
            const rList = Object.keys(rData)
              .map(k => ({ ...rData[k], id: k }))
              .filter(p => p.id !== postId)
              .slice(0, 3);
            setRelatedPosts(rList);
          }
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPostAndComments();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) { alert("Universe entry required: Please sign in to react."); return; }
    if (!post) return;
    
    try {
      const likeRef = ref(db, `likes/${post.id}/${user.uid}`);
      const likedState = !liked;
      
      await runTransaction(ref(db, `posts/${post.id}/likes`), (curr) => {
        if (likedState) return (curr || 0) + 1;
        return Math.max(0, (curr || 0) - 1);
      });

      if (likedState) {
        await set(likeRef, true);
      } else {
        await set(likeRef, null);
      }
      
      setLiked(likedState);
      setPost({ ...post, likes: likedState ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1) });
    } catch (e: any) { console.error(e); }
  };

  const handleBookmark = async () => {
    if (!user) { alert("Vault access denied: Please sign in to save archives."); return; }
    if (!post) return;
    try {
      const bRef = ref(db, `bookmarks/${user.uid}/${post.id}`);
      const newState = !bookmarked;
      if (newState) {
        await set(bRef, {
          postId: post.id,
          title: post.title,
          slug: post.slug,
          coverImage: post.coverImage,
          category: post.category,
          bookmarkedAt: Date.now()
        });
      } else {
        await set(bRef, null);
      }
      setBookmarked(newState);
    } catch (e) { console.error(e); }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubmittingNews(true);
    try {
      const newRef = push(ref(db, "newsletter"));
      await set(newRef, { email: email.trim(), createdAt: Date.now() });
      alert("Dispatch Enrollment Successful: You are now subscribed to the ledger abstracts.");
      setEmail("");
    } catch (e) { alert("Enrollment failure: Ledger rejection."); }
    finally { setSubmittingNews(false); }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="font-serif italic text-slate-400 animate-pulse">Retrieving Manuscript...</p>
      </div>
    </div>
  );

  if (!post) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl text-rose-500">Not found.</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617]">
      <Helmet><title>{post.title} | MDev Studio</title></Helmet>
      
      <header className="relative h-[85vh] w-full overflow-hidden flex items-end">
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 1.8, ease: "easeOut" }} 
          src={post.coverImage} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-8 pb-24 w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
            className="max-w-4xl space-y-12"
          >
            <div className="flex items-center gap-6">
              <span className="bg-primary/20 backdrop-blur-md text-primary text-[9px] font-black uppercase tracking-[0.5em] px-6 py-2 rounded-full border border-primary/20">
                {post.category}
              </span>
              <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                <Clock size={12} /> {Math.ceil(post.content.length / 1000)} MIN READ
              </span>
            </div>
            
            <h1 className="text-7xl md:text-[8rem] font-serif font-black text-white leading-[0.9] tracking-tighter">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 pt-10 border-t border-white/10">
              <img src={`https://ui-avatars.com/api/?name=${post.authorName}&background=random`} className="w-12 h-12 rounded-full border-2 border-white/20" alt="" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">{post.authorName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-8">
          <article className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>

          <div className="mt-32 pt-16 border-t border-slate-50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-12">
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleLike} 
                className={`btn-primary px-12 py-5 shadow-2xl ${liked ? 'bg-rose-500 text-white' : ''}`}
              >
                <Heart size={18} className={liked ? "fill-white animate-pulse" : ""} /> 
                <span className="ml-2">{post.likes || 0}</span>
              </motion.button>
              
              <button className="w-16 h-16 rounded-full glass flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                <Share2 size={20} />
              </button>
              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className={`w-16 h-16 rounded-full glass flex items-center justify-center transition-all ${bookmarked ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}
              >
                {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Discussions */}
          <section className="mt-48 space-y-16">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary flex items-center gap-3"><MessageCircle size={14} /> Discussions</span>
              <h3 className="text-6xl font-serif font-black text-slate-900 dark:text-white leading-none">Voices.</h3>
            </div>

            {/* Related Artifacts */}
            {relatedPosts.length > 0 && (
              <div className="pt-24 space-y-12">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronous Artifacts</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map(p => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="group space-y-4">
                      <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                        <img src={p.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <h4 className="font-serif font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors italic">"{p.title}"</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {user ? (
              <form onSubmit={handleCommentSubmit} className="space-y-8 premium-card p-12 bg-slate-50/50 dark:bg-slate-900/30">
                <textarea 
                  value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your perspective..."
                  className="w-full p-0 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 text-2xl font-serif italic text-slate-900 dark:text-white focus:border-primary outline-none transition-all min-h-[120px] pb-8"
                />
                <div className="flex justify-end">
                  <button disabled={submittingComment || !newComment.trim()} className="btn-primary-shimmer px-12 py-5">
                    {submittingComment ? "Archiving..." : "Post Reflection"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-20 premium-card text-center space-y-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                <h4 className="text-4xl font-serif font-black italic">Join the intellectual discourse.</h4>
                <Link to="/login" className="btn-primary-shimmer py-5 px-16 inline-flex border-2 border-white/20">Sign In to Continue</Link>
              </div>
            )}

            <div className="space-y-16 mt-24">
              {comments.map((c, idx) => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="group relative pb-16"
                >
                  <div className="flex items-start gap-8">
                     <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-primary text-xs border border-slate-100 dark:border-slate-800">
                        {c.userName.charAt(0)}
                     </div>
                     <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">{c.userName}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-serif italic opacity-80 select-all">"{c.content}"</p>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-16">
          <div className="sticky top-32 space-y-16">
             <div className="premium-card p-12 bg-primary text-white space-y-10 relative overflow-hidden group">
                <Sparkles className="absolute -top-10 -right-10 w-48 h-48 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-4xl font-serif font-black leading-none">MDev<br/>Bulletin.</h3>
                  <p className="text-primary-100 leading-relaxed italic opacity-80">Weekly architectural abstracts curated for the modern creator.</p>
                  <form onSubmit={handleNewsletter} className="space-y-4">
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address" 
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all font-bold" 
                    />
                    <button disabled={submittingNews} className="btn-primary bg-white text-primary w-full py-5 text-[10px] uppercase font-black tracking-widest">
                      {submittingNews ? "Enrolling..." : "Enroll Now"}
                    </button>
                  </form>
                </div>
             </div>
             
             <div className="space-y-8 px-4">
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Collaborate</span>
               <p className="text-slate-400 font-medium italic text-sm leading-relaxed">Interested in contributing to the ledger? Reach out to our curation team.</p>
               <button className="btn-ghost flex items-center gap-3 group/link p-0">
                  Documentation <CornerDownRight size={14} className="group-hover/link:translate-x-1 group-hover/link:translate-y-[-1px] transition-transform" />
               </button>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
