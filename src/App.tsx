import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ShowsPage } from './pages/ShowsPage';
import { GifsPage } from './pages/GifsPage';

const CollageBuilder = import.meta.env.DEV
  ? lazy(() => import('./dev/CollageBuilder').then((m) => ({ default: m.CollageBuilder })))
  : null;

function GifTagRedirect() {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  return <Navigate to={`/projects/gifs/tag/${tagSlug}`} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/bluesky" element={<BlogPage />} />
          <Route path="/blog/letterboxd" element={<BlogPage />} />
          <Route path="/blog/all" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/projects/gifs" element={<GifsPage key="all" />} />
          <Route path="/projects/gifs/tag/:tagSlug" element={<GifsPage key="tag" />} />
          <Route path="/gifs" element={<Navigate to="/projects/gifs" replace />} />
          <Route path="/gifs/tag/:tagSlug" element={<GifTagRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        {CollageBuilder && (
          <Route
            path="/dev/collages"
            element={
              <Suspense fallback={null}>
                <CollageBuilder />
              </Suspense>
            }
          />
        )}
      </Routes>
      <Toaster position="bottom-center" />
    </>
  );
}
