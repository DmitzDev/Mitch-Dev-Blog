import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, push, set, get, update } from "firebase/database";
import { db } from "../../firebase/config";
import { useAuth } from "../../components/AuthProvider";
import { ImageCropper } from "../../components/ImageCropper";
import { Helmet } from "react-helmet-async";
import slugify from "slugify";

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
  const [coverImage, setCoverImage] = useState(""); // This will now store the Base64 string directly
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    const fetchPost = async () => {
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
    fetchPost();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const slug = slugify(title, { lower: true, strict: true });
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      const postData: any = {
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tagsArray,
        coverImage, // DIRECT BASE64 SAVE (NO STORAGE NEEDED)
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

  if (fetching) return <div className="min-h-screen flex items-center justify-center font-serif text-xl animate-pulse italic">Retrieving artifact...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet><title>{isEditing ? "Edit" : "New"} Story | MDev.</title></Helmet>
      
      <div className="mb-12">
        <h1 className="text-5xl font-serif font-black text-slate-900 dark:text-white leading-none tracking-tight">
          {isEditing ? "Refine story." : "Build story."}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 block">Visual Identity (Base64)</label>
            <ImageCropper
              initialImage={coverImage}
              onCropComplete={(base64) => setCoverImage(base64)}
            />
          </div>

          <div className="space-y-8">
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white placeholder:text-slate-100 outline-none p-0"
              placeholder="Thesis title..."
            />
            <textarea
              required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-transparent border-none text-xl font-serif italic text-slate-400 outline-none p-0 resize-none"
              placeholder="The abstract hook..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6 py-4 outline-none font-bold text-sm" placeholder="Domain..." />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6 py-4 outline-none font-bold text-sm" placeholder="Labels..." />
            </div>
          </div>

          <div className="pt-10">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Manuscript</label>
            <textarea
              required rows={15} value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl px-8 py-8 outline-none font-mono text-sm leading-relaxed"
              placeholder="Elaborate your thoughts..."
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-8">
          <button type="button" onClick={() => navigate("/admin/posts")} className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-slate-900">Abort</button>
          
          <button
            type="submit" disabled={loading}
            className="bg-primary text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all hover:bg-black dark:hover:bg-white dark:hover:text-black disabled:opacity-50"
          >
            {loading ? "Archiving..." : isEditing ? "Update Story" : "Seal & Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
