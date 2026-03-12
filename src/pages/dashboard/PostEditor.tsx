import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get, update } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { ImageCropper } from "../../components/ImageCropper";
import { Helmet } from "react-helmet-async";
import slugify from "slugify";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, X } from "lucide-react";

export function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchPostAndCats = async () => {
      // Fetch categories
      try {
        const catsRef = ref(db, "categories");
        const snapshot = await get(catsRef);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          setCategories(Object.keys(raw).map(k => ({ id: k, name: raw[k].name })));
        } else {
          // Fallback if DB is empty
          const defaults = ['Technology', 'Programming', 'Travel', 'Lifestyle', 'Gaming'];
          setCategories(defaults.map((name, i) => ({ id: `default-${i}`, name })));
        }
      } catch (e) { console.error(e); }

      if (!isEditing || !id) return;
      try {
        const snapshot = await get(ref(db, `posts/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTitle(data.title || "");
          setContent(data.content || "");
          setExcerpt(data.excerpt || "");
          setCategory(data.category || "");
          setTags(data.tags ? data.tags.join(", ") : "");
          setCoverImage(data.coverImage || "");
        }
      } catch (error) { console.error(error); } finally { setFetching(false); }
    };
    fetchPostAndCats();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const slug = slugify(title, { lower: true, strict: true });
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      const postData: any = {
        title, slug, content, excerpt, category,
        tags: tagsArray,
        coverImage,
        updatedAt: Date.now(),
      };

      if (isEditing && id) {
        await update(ref(db, `posts/${id}`), postData);
      } else {
        const newPostRef = push(ref(db, "posts"));
        const fallbackName = user.email ? user.email.split('@')[0] : "Anonymous";
        const authorName = user.displayName || fallbackName;

        await set(newPostRef, {
          ...postData,
          id: newPostRef.key,
          authorId: user.uid,
          authorName: authorName,
          publishedAt: Date.now(),
          createdAt: Date.now(),
          likes: 0,
          views: 0,
        });
      }
      navigate("/admin/posts");
    } catch (error: any) {
      alert(`Database Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center font-serif text-3xl animate-pulse italic">Curating...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <Helmet><title>{isEditing ? "Edit" : "New"} Entry | MDev.</title></Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-16"
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Ledger
        </button>
        <h1 className="text-5xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">
          {isEditing ? "Refine Entry." : "New Entry."}
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Controls */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none text-5xl md:text-7xl font-serif font-black text-slate-900 dark:text-white placeholder:text-slate-100 dark:placeholder:text-slate-800 outline-none p-0 leading-tight"
                placeholder="Entry Title..."
              />
              <textarea
                required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-serif italic text-slate-400 outline-none p-0 resize-none leading-relaxed"
                placeholder="The narrative hook goes here..."
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                <Sparkles size={12} /> Manuscript Content
              </label>
              <textarea
                required rows={20} value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] px-10 py-10 outline-none font-mono text-sm leading-relaxed border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all text-slate-600 dark:text-slate-300"
                placeholder="### Start writing your story in Markdown..."
              />
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Visual Artifact</label>
              <ImageCropper
                initialImage={coverImage}
                onCropComplete={(base64) => setCoverImage(base64)}
              />
            </div>

            <div className="space-y-8 bg-slate-50/50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Category</label>
                <select
                  required value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none font-bold text-xs border border-slate-100 dark:border-slate-700/50 appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 outline-none font-bold text-xs border border-slate-100 dark:border-slate-700/50" placeholder="tag1, tag2..." />
              </div>

              <div className="pt-8 flex flex-col gap-4">
                <button
                  type="submit" disabled={loading}
                  className="btn-primary-shimmer w-full py-5 text-sm uppercase font-black"
                >
                  <Send size={14} className={loading ? "animate-ping" : ""} /> {loading ? "Archiving..." : "Publish Entry"}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex items-center justify-center gap-2">
                  <X size={14} /> Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
