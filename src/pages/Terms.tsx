import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

export function Terms() {
  const lastUpdated = "March 13, 2026";

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] pt-32 pb-20 px-4">
      <Helmet>
        <title>Terms of Service - MDev.</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              Terms <span className="text-primary italic">&</span> Conditions
            </h1>
            <p className="text-slate-500 font-medium uppercase tracking-[0.3em] text-[10px]">
              Last Updated: {lastUpdated}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">01</span>
                Agreement to Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                By accessing MDev. (the "Website"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service. These terms are a legally binding agreement between you and MDev.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">02</span>
                Intellectual Property
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The Website and its original content, features, and functionality are and will remain the exclusive property of MDev. and its licensors. Our content is protected by copyright, trademark, and other laws of both the Philippines and foreign countries.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">03</span>
                User Contributions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                As a user of MDev., you may be permitted to post blog comments or other content. You retain all rights to your contributions, but you grant MDev. a non-exclusive, perpetual license to use, reproduce, and display such content in connection with the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">04</span>
                Prohibited Uses
              </h2>
              <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2">
                <li>You may not use the platform for any illegal purpose.</li>
                <li>You may not attempt to gain unauthorized access to our database.</li>
                <li>You may not use the platform to share spam or malicious software.</li>
                <li>You may not impersonate other users or the administrator.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">05</span>
                Administrative Authority
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The Administrator (admin@gmail.com) reserves the right to remove any post, comment, or user account at their sole discretion, without prior notice, for conduct that violates these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-primary text-sm font-black">06</span>
                Disclaimer
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                The information provided on MDev. is for educational and entertainment purposes only. We make no warranties regarding the accuracy or completeness of the content shared on this platform.
              </p>
            </section>
          </div>

          {/* Footer of the page */}
          <div className="pt-20 text-center">
            <button 
              onClick={() => window.history.back()}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline underline-offset-8"
            >
              Back to safe territory
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
