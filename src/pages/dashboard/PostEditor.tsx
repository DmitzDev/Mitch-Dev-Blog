import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get, update } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { ImageCropper } from "../../components/ImageCropper";
import { Helmet } from "react-helmet-async";
import slugify from "slugify";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, X, Eye, Edit3, Trash2, Tag, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [isPreview, setIsPreview] = useState(false);

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchPostAndCats = async () => {
      try {
        const catsRef = ref(db, "categories");
        const snapshot = await get(catsRef);
        if (snapshot.exists()) {
          const raw = snapshot.val();
          setCategories(Object.keys(raw).map(k => ({ id: k, name: raw[k].name })));
        } else {
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

  useEffect(() => {
    // Sync preview state to navbar
    window.dispatchEvent(new CustomEvent('studio-preview-state', { detail: isPreview }));

    const handlePublish = () => handleSubmit(new Event('submit') as any);
    const handlePreviewToggle = (e: any) => setIsPreview(e.detail);

    window.addEventListener('studio-publish', handlePublish);
    window.addEventListener('studio-preview-toggle', handlePreviewToggle);

    return () => {
      window.removeEventListener('studio-publish', handlePublish);
      window.removeEventListener('studio-preview-toggle', handlePreviewToggle);
    };
  }, [isPreview, title, content, category, excerpt, tags, coverImage, user, isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (!title || !content || !category) {
      alert("Please complete the required fields: Title, Content, and Category.");
      return;
    }

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

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#020617] text-slate-900 dark:text-white">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
      <p className="font-serif italic text-2xl animate-pulse">Curating Studio...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
      <Helmet><title>{isEditing ? "Refine" : "Compose"} Artifact | MDev.</title></Helmet>

      <main className="max-w-[1600px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Editor Workspace */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {isPreview ? (
                <motion.div 
                  key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="space-y-8 pb-16 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">{category || "Uncategorized"}</span>
                    <h1 className="text-7xl font-serif font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
                      {title || "Untitled Manuscript"}
                    </h1>
                    <p className="text-2xl font-serif italic text-slate-400 leading-relaxed border-l-4 border-slate-100 dark:border-slate-800/50 pl-10">
                      {excerpt || "No narrative hook provided."}
                    </p>
                  </div>
                  <article className="prose dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Silence... Start typing to generate content.*"}</ReactMarkdown>
                  </article>
                </motion.div>
              ) : (
                <motion.div 
                  key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <input
                      type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent border-none text-7xl font-serif font-black text-slate-900 dark:text-white placeholder:text-slate-100 dark:placeholder:text-slate-800/20 outline-none p-0 leading-none tracking-tighter"
                      placeholder="Enter identity title..."
                    />
                    <textarea
                      required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full bg-transparent border-none text-2xl font-serif italic text-slate-400 dark:text-slate-500 outline-none p-0 resize-none leading-relaxed"
                      placeholder="Summarize the narrative hook..."
                    />
                  </div>

                  <div className="space-y-6 flex flex-col min-h-[600px]">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                        <Sparkles size={14} /> Manuscript Markdown
                      </label>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{content.length} characters</span>
                    </div>
                    <textarea
                      required value={content} onChange={(e) => setContent(e.target.value)}
                      className="flex-1 w-full bg-slate-50/30 dark:bg-slate-900/10 rounded-[2rem] px-8 py-8 outline-none font-mono text-base leading-relaxed border-2 border-transparent focus:border-primary/5 transition-all text-slate-700 dark:text-slate-300"
                      placeholder="### Start the deep transmission..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata Sidebar */}
          <aside className="lg:col-span-4 space-y-12 sticky top-36">
            <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 p-10 space-y-12 shadow-editorial">
              
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
                  <BookOpen size={12} /> Visual Artifact
                </label>
                <ImageCropper
                  initialImage={coverImage}
                  onCropComplete={(base64) => setCoverImage(base64)}
                />
              </div>

              <div className="space-y-8 border-t border-slate-50 dark:border-slate-800/50 pt-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Tag size={12} /> Category
                  </label>
                  <select
                    required value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none font-bold text-xs appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                  >
                    <option value="">Select Classification</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Sparkles size={12} /> Taxonomy Tags
                  </label>
                  <input 
                    type="text" value={tags} onChange={(e) => setTags(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none font-bold text-xs focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white" 
                    placeholder="e.g. design, node, architecture" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex flex-col gap-4">
                <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
                  <X size={14} /> Discard Draft
                </button>
              </div>
            </div>

            <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10">
               <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Writing Tip</p>
               <p className="text-xs text-slate-500 italic leading-relaxed">"Markdown allows you to structure your architectural thoughts with precision. Use # for headers and * for emphasis."</p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
