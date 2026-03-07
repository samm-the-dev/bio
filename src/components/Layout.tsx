import { Outlet, Link, NavLink } from 'react-router-dom';
import { Moon, Share2, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { settings } from '@/data/settings';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Me' },
  { to: '/projects', label: 'Projects' },
];

async function handleShare() {
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Sam Marsh', url });
      return;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  } catch {
    toast.error('Could not copy link');
  }
}

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-primary-hover"
              aria-label={`${settings.name} home`}
            >
              <span className="sm:hidden">SM</span>
              <span className="hidden sm:inline">{settings.name}</span>
            </Link>
            <nav className="flex items-center gap-4">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'text-sm transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => void handleShare()}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Share this page"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 hover:bg-muted"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 px-6 py-8 sm:px-12 lg:px-24">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border">
        <div className="container mx-auto flex items-center justify-center px-4 py-6 text-sm text-muted-foreground">
          {settings.repoUrl && (
            <a
              href={settings.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Source on GitHub
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
