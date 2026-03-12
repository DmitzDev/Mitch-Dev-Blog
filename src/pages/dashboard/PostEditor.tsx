import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/config";
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
  const [coverImage, setCoverImage] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditing || !id) return;

      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setContent(data.content || "");
          setExcerpt(data.excerpt || "");
          setCategory(data.category || "");
          setTags(data.tags ? data.tags.join(", ") : "");
          setCoverImage(data.coverImage || "");
        } else {
          alert("Post not found!");
          navigate("/admin/posts");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const slug = slugify(title, { lower: true, strict: true });
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

      let finalCoverImage = coverImage;
      if (coverImageFile) {
        const fileExt = "jpg";
        const fileName = `posts/cover-images/${Date.now()}-${user.uid}.${fileExt}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, coverImageFile);
        finalCoverImage = await getDownloadURL(storageRef);
      }

      const postData = {
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tagsArray,
        coverImage: finalCoverImage,
        updatedAt: Date.now(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, "posts", id), postData);
      } else {
        const newPostRef = doc(collection(db, "posts"));
        await setDoc(newPostRef, {
          ...postData,
          id: newPostRef.id,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          publishedAt: Date.now(),
          createdAt: Date.now(),
          likes: 0,
          views: 0,
        });
      }

      navigate("/admin/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>{isEditing ? "Edit Post" : "New Story"} - MitchDevBlog</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          {isEditing ? "Edit Story" : "Write a Story"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors text-lg font-serif"
              placeholder="Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Image
            </label>
            <ImageCropper
              initialImage={coverImage}
              onCropComplete={(blob, previewUrl) => {
                setCoverImageFile(blob);
                setCoverImage(previewUrl);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                placeholder="Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
                placeholder="react, web development, tutorial"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Excerpt
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors resize-none"
              placeholder="A brief summary of your story..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
              <span>Content (Markdown)</span>
              <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">Markdown Guide</a>
            </label>
            <textarea
              required
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors font-mono text-sm"
              placeholder="Write your story here..."
            />
          </div>

        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/posts")}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Story" : "Publish Story"}
          </button>
        </div>
      </form>
    </div>
  );
}
