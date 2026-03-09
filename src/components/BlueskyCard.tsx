import { useState } from 'react';
import type { BlueskyPost } from '@/hooks/useBlueskyFeed';
import { formatDate } from '@/lib/formatDate';
import { BlueskyDialog } from '@/components/BlueskyDialog';
import { FeedCard } from '@/components/FeedCard';
import { HlsVideo } from '@/components/HlsVideo';
import { BlueskyIcon } from '@/components/icons';

interface BlueskyCardProps {
  post: BlueskyPost;
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

export function BlueskyCard({ post }: BlueskyCardProps) {
  const [open, setOpen] = useState(false);
  const displayText = post.text;
  const isGif = post.external ? isGifEmbed(post.external.uri) : false;

  return (
    <>
      <FeedCard onClick={() => setOpen(true)}>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <BlueskyIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              Bluesky
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-card-foreground">{displayText}</p>

          {post.quotedPost && (
            <div className="mt-2 overflow-hidden rounded border border-border bg-muted/50">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{post.quotedPost.author.displayName}</span> @
                  {post.quotedPost.author.handle}
                </p>
                {post.quotedPost.text && (
                  <p className="mt-1 text-xs text-card-foreground">
                    {post.quotedPost.text.length > 120
                      ? post.quotedPost.text.slice(0, 120) + '...'
                      : post.quotedPost.text}
                  </p>
                )}
              </div>
              {post.quotedPost.images.length > 0 && (
                <div className="flex gap-px">
                  {post.quotedPost.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="min-w-0 flex-1">
                      <img
                        src={img.thumb}
                        alt={img.alt}
                        className="h-24 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <time className="mt-2 block text-xs text-muted-foreground" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          {(post.replyCount > 0 || post.repostCount > 0 || post.likeCount > 0) && (
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {post.replyCount > 0 && <span>{post.replyCount} replies</span>}
              {post.repostCount > 0 && <span>{post.repostCount} reposts</span>}
              {post.likeCount > 0 && <span>{post.likeCount} likes</span>}
            </div>
          )}
        </div>

        {/* Images flush to bottom */}
        {post.hasImages && (
          <div className="relative flex gap-px">
            {post.images.slice(0, 4).map((img, i) => (
              <div key={i} className="min-w-0 flex-1">
                <img
                  src={img.thumb}
                  alt={img.alt}
                  className={`w-full object-cover ${post.images.length === 1 ? 'max-h-48' : 'h-32'}`}
                  loading="lazy"
                />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        )}

        {/* External embed / link card / GIF flush to bottom */}
        {post.external && !post.hasImages && (
          <div className="border-t border-border">
            {isGif ? (
              <img
                src={post.external.uri}
                alt={post.external.title || ''}
                className="w-full object-contain"
                loading="lazy"
              />
            ) : (
              post.external.thumb && (
                <div className="relative">
                  <img
                    src={post.external.thumb}
                    alt={post.external.title || ''}
                    className="max-h-48 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )
            )}
            {!isGif && post.external.title && (
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-card-foreground">{post.external.title}</p>
                {post.external.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {post.external.description}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(() => {
                    try {
                      return new URL(post.external!.uri).hostname;
                    } catch {
                      return '';
                    }
                  })()}
                </p>
              </div>
            )}
          </div>
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
            const replyIsGif = reply.external ? isGifEmbed(reply.external.uri) : false;
            return (
              <div key={reply.uri} className="border-t border-border">
                {reply.text && (
                  <div className="px-4 pb-2 pt-4">
                    <p className="whitespace-pre-wrap text-sm text-card-foreground">{reply.text}</p>
                  </div>
                )}

                {reply.hasImages && (
                  <div className="relative flex gap-px">
                    {reply.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="min-w-0 flex-1">
                        <img
                          src={img.thumb}
                          alt={img.alt}
                          className={`w-full object-cover ${reply.images.length === 1 ? 'max-h-48' : 'h-32'}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>
                )}

                {reply.external && !reply.hasImages && (
                  <div className={reply.text ? 'border-t border-border' : ''}>
                    {replyIsGif ? (
                      <img
                        src={reply.external.uri}
                        alt={reply.external.title || ''}
                        className="w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      reply.external.thumb && (
                        <div className="relative">
                          <img
                            src={reply.external.thumb}
                            alt={reply.external.title || ''}
                            className="max-h-48 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )
                    )}
                    {!replyIsGif && reply.external.title && (
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-card-foreground">
                          {reply.external.title}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {reply.video && (
                  <HlsVideo
                    src={reply.video.playlist}
                    poster={reply.video.thumbnail || undefined}
                    className="w-full"
                    ariaLabel={reply.video.alt || 'Video'}
                  />
                )}

                <div className="px-4 py-2">
                  <time
                    className="block text-xs text-muted-foreground"
                    dateTime={reply.publishedAt}
                  >
                    {formatDate(reply.publishedAt)}
                  </time>
                  {(reply.replyCount > 0 || reply.repostCount > 0 || reply.likeCount > 0) && (
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {reply.replyCount > 0 && <span>{reply.replyCount} replies</span>}
                      {reply.repostCount > 0 && <span>{reply.repostCount} reposts</span>}
                      {reply.likeCount > 0 && <span>{reply.likeCount} likes</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </FeedCard>

      {open && <BlueskyDialog post={post} onClose={() => setOpen(false)} />}
    </>
  );
}
