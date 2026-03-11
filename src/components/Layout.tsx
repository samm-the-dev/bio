import { Outlet, Link, NavLink } from 'react-router-dom';
import { Moon, Share2, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { settings } from '@/data/settings';
import { shareUrl } from '@/lib/share';

const navItems = [
  { to: '/', label: 'Home', hideOnMobile: true },
  { to: '/about', label: 'About', smLabel: 'About Me' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/shows', label: 'Shows' },
];

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
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
            <nav className="flex items-center gap-3 sm:gap-4">
              {navItems.map(({ to, label, smLabel, hideOnMobile }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'whitespace-nowrap text-sm transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                      hideOnMobile && 'hidden sm:inline',
                    )
                  }
                >
                  {smLabel ? (
                    <>
                      <span className="sm:hidden">{label}</span>
                      <span className="hidden sm:inline">{smLabel}</span>
                    </>
                  ) : (
                    label
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => void shareUrl(window.location.href, settings.name)}
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

      <main id="main-content" className="min-w-0 flex-1 px-6 py-8 sm:px-12 md:px-16 lg:px-24">
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
