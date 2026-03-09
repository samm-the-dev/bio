import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { BlueskyPost } from '@/hooks/useBlueskyFeed';
import { formatDate } from '@/lib/formatDate';
import { LinkifiedText } from '@/components/LinkifiedText';
import { ImageLightbox } from '@/components/ImageLightbox';
import { HlsVideo } from '@/components/HlsVideo';
import { BlueskyIcon } from '@/components/icons';

interface BlueskyDialogProps {
  post: BlueskyPost;
  onClose: () => void;
}

const GIF_HOSTS = ['tenor.com', 'giphy.com', 'media.tenor.com'];

function isGifEmbed(uri: string): boolean {
  try {
    const host = new URL(uri).hostname;
    return GIF_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

export function BlueskyDialog({ post, onClose }: BlueskyDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{
    images: { src: string; alt: string }[];
    index: number;
  } | null>(null);

  const isGif = post.external ? isGifEmbed(post.external.uri) : false;
  const allImages = post.images.map((img) => ({ src: img.fullsize, alt: img.alt }));
  const quoteImages = post.quotedPost
    ? post.quotedPost.images.map((img) => ({ src: img.fullsize, alt: img.alt }))
    : [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- keyboard close handled via useEffect
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="Bluesky post"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card text-card-foreground outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-4">
          <div className="flex items-center gap-2">
            <BlueskyIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Bluesky</span>
          </div>

          <LinkifiedText
            text={post.text}
            className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-card-foreground"
          />

          {post.quotedPost && (
            <div className="mt-3 overflow-hidden rounded border border-border bg-muted/50">
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {post.quotedPost.author.displayName}{' '}
                  <span className="font-normal">@{post.quotedPost.author.handle}</span>
                </p>
                {post.quotedPost.text && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-card-foreground">
                    {post.quotedPost.text}
                  </p>
                )}
              </div>
              {post.quotedPost.images.length > 0 && (
                <div className="flex gap-px">
                  {post.quotedPost.images.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setLightbox({ images: quoteImages, index: i })}
                      className="min-w-0 flex-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                    >
                      <img
                        src={img.fullsize}
                        alt={img.alt}
                        className="h-32 w-full object-cover transition-opacity hover:opacity-80"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Images flush to bottom */}
        {post.hasImages && (
          <div className="relative flex gap-px overflow-hidden">
            {post.images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setLightbox({ images: allImages, index: i })}
                className="min-w-0 flex-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <img
                  src={img.fullsize}
                  alt={img.alt}
                  className={`w-full object-cover transition-opacity hover:opacity-80 ${
                    post.images.length === 1 ? 'max-h-80' : 'h-48'
                  }`}
                  loading="lazy"
                />
              </button>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        )}

        {/* External embed / link card / GIF */}
        {post.external && !post.hasImages && (
          <a
            href={post.external.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block overflow-hidden border-t border-border transition-colors hover:bg-muted/50"
          >
            {isGif ? (
              <img
                src={post.external.uri}
                alt={post.external.title || ''}
                className="w-full object-contain"
                loading="lazy"
              />
            ) : post.external.thumb ? (
              <img
                src={post.external.thumb}
                alt={post.external.title || ''}
                className="w-full object-cover"
                loading="lazy"
              />
            ) : null}
            {!isGif && (post.external.title || post.external.description) && (
              <div className={`px-4 py-2.5 ${post.external.thumb ? 'border-t border-border' : ''}`}>
                {post.external.title && (
                  <p className="text-sm font-medium text-card-foreground">{post.external.title}</p>
                )}
                {post.external.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {post.external.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {(() => {
                    try {
                      return new URL(post.external.uri).hostname;
                    } catch {
                      return post.external.uri;
                    }
                  })()}
                </p>
              </div>
            )}
          </a>
        )}

        {/* Video embed (GIFs in newer Bluesky) */}
        {post.video && (
          <HlsVideo
            src={post.video.playlist}
            poster={post.video.thumbnail || undefined}
            className="w-full"
            ariaLabel={post.video.alt || 'Video'}
          />
        )}

        {/* Thread replies */}
        {post.threadReplies.length > 0 &&
          post.threadReplies.map((reply) => {
            const replyImages = reply.images.map((img) => ({ src: img.fullsize, alt: img.alt }));
            const replyIsGif = reply.external ? isGifEmbed(reply.external.uri) : false;
            return (
              <div key={reply.uri} className="border-t border-border">
                {reply.text && (
                  <div className="p-4 pb-3">
                    <LinkifiedText
                      text={reply.text}
                      className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground"
                    />
                  </div>
                )}

                {reply.hasImages && (
                  <div className="relative flex gap-px overflow-hidden">
                    {reply.images.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setLightbox({ images: replyImages, index: i })}
                        className="min-w-0 flex-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                      >
                        <img
                          src={img.fullsize}
                          alt={img.alt}
                          className={`w-full object-cover transition-opacity hover:opacity-80 ${
                            reply.images.length === 1 ? 'max-h-80' : 'h-48'
                          }`}
                          loading="lazy"
                        />
                      </button>
                    ))}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                )}

                {reply.external && !reply.hasImages && (
                  <a
                    href={reply.external.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block overflow-hidden transition-colors hover:bg-muted/50"
                  >
                    {replyIsGif ? (
                      <img
                        src={reply.external.uri}
                        alt={reply.external.title || ''}
                        className="w-full object-contain"
                        loading="lazy"
                      />
                    ) : reply.external.thumb ? (
                      <img
                        src={reply.external.thumb}
                        alt={reply.external.title || ''}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    {!replyIsGif && (reply.external.title || reply.external.description) && (
                      <div
                        className={`px-4 py-2.5 ${reply.external.thumb ? 'border-t border-border' : ''}`}
                      >
                        {reply.external.title && (
                          <p className="text-sm font-medium text-card-foreground">
                            {reply.external.title}
                          </p>
                        )}
                        {reply.external.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {reply.external.description}
                          </p>
                        )}
                      </div>
                    )}
                  </a>
                )}

                {reply.video && (
                  <HlsVideo
                    src={reply.video.playlist}
                    poster={reply.video.thumbnail || undefined}
                    className="w-full"
                    ariaLabel={reply.video.alt || 'Video'}
                  />
                )}
              </div>
            );
          })}

        {/* Footer: timestamp, stats, view link */}
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {(post.replyCount > 0 || post.repostCount > 0 || post.likeCount > 0) && (
            <div className="mt-1 flex items-center gap-3">
              {post.replyCount > 0 && <span>{post.replyCount} replies</span>}
              {post.repostCount > 0 && <span>{post.repostCount} reposts</span>}
              {post.likeCount > 0 && <span>{post.likeCount} likes</span>}
            </div>
          )}
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View on Bluesky
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
