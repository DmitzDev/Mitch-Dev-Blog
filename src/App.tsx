import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Suspense, lazy } from "react";

const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login as React.ComponentType<any> })));
const Register = lazy(() => import("./pages/Register").then(m => ({ default: m.Register as React.ComponentType<any> })));
const BlogList = lazy(() => import("./pages/blog/BlogList").then(m => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import("./pages/blog/BlogDetail").then(m => ({ default: m.BlogDetail })));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const ManagePosts = lazy(() => import("./pages/dashboard/ManagePosts").then(m => ({ default: m.ManagePosts })));
const PostEditor = lazy(() => import("./pages/dashboard/PostEditor").then(m => ({ default: m.PostEditor })));
const ManageComments = lazy(() => import("./pages/dashboard/ManageComments").then(m => ({ default: m.ManageComments })));
const ManageCategories = lazy(() => import("./pages/dashboard/ManageCategories").then(m => ({ default: m.ManageCategories })));
const ManageBookmarks = lazy(() => import("./pages/dashboard/ManageBookmarks").then(m => ({ default: m.ManageBookmarks })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.Terms })));

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="medium-clone-theme">
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 font-sans text-sky-500"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin mb-4"></div><p>Loading...</p></div></div>}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="blog" element={<BlogList />} />
                  <Route path="blog/:slug" element={<BlogDetail />} />
                  <Route path="terms" element={<Terms />} />

                  <Route path="admin" element={<ProtectedRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="posts" element={<ManagePosts />} />
                    <Route path="posts/new" element={<PostEditor />} />
                    <Route path="posts/:id/edit" element={<PostEditor />} />
                    <Route path="comments" element={<ManageComments />} />
                    <Route path="categories" element={<ManageCategories />} />
                    <Route path="bookmarks" element={<ManageBookmarks />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
