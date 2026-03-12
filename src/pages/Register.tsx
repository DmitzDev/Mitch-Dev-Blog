import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { ref, set, get } from "firebase/database";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, ArrowRight } from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const syncUserToDB = async (authUser: any, displayName: string) => {
    try {
      const userRef = ref(db, `users/${authUser.uid}`);
      const isAdminEmail = authUser.email === "admin@gmail.com";
      
      await set(userRef, {
        uid: authUser.uid,
        displayName: displayName || authUser.displayName || "Anonymous",
        email: authUser.email,
        photoURL: authUser.photoURL || "",
        role: isAdminEmail ? 'admin' : 'user',
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Identity synchronization failed:", e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserToDB(result.user, result.user.displayName || "");
      navigate("/admin");
    } catch (err: any) {
      setError("Universe entry rejected: Google sync failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      await syncUserToDB(userCredential.user, name);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 relative bg-white dark:bg-[#020617]">
      <Helmet>
        <title>Sign Up - MitchDevBlog</title>
      </Helmet>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-6 md:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 my-10"
      >
        <div className="text-center mb-6">
          <div className="mb-6 flex justify-center">
            <img
              src="/img/MDLogo.png"
              alt="MDev logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h2 className="text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white mb-3">
            Start Writing
          </h2>
          <p className="text-slate-500 font-medium mb-6 text-sm">
            Join the community of developers
          </p>

        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 dark:bg-red-900/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/20"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
          >
            {loading ? "Creating..." : "Initialize Profile"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">OR</span>
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 group shadow-sm bg-white dark:bg-transparent mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Continue with Google
        </button>

        <div className="text-center">
          <p className="text-slate-500 font-medium text-sm">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
