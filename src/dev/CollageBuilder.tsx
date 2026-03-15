/**
 * Dev-only collage builder. Load at /dev/collages in dev mode.
 *
 * Select GIFs by tag → assign to rows → scrub frames with ◀▶ →
 * focus mode to screenshot → copy config to paste into scripts.
 *
 * Uses ImageDecoder API (Chrome/Edge only) for frame-accurate scrubbing.
 */
import { useState, useEffect, useRef } from 'react';
import { gifs } from '@/data/gifs';
import { collectTags } from '@/lib/tagged';
import type { Gif } from '@/lib/queries';

// ---- constants ----

const TILE_H = 180; // preview height (actual output uses 210)
const CANVAS_W = 1200; // for fill% calculation only
const FILL_WARN = 0.85;

// ---- types ----

type TileState = { gif: Gif; frameIndex: number };
type Rows = [TileState[], TileState[], TileState[]];

// ---- helpers ----

function tileW(gif: Gif) {
  return Math.round(TILE_H * (gif.width / gif.height));
}

function rowNaturalWidth(row: TileState[]) {
  return row.reduce((s, t) => s + tileW(t.gif), 0);
}

function fillPct(row: TileState[]) {
  return (rowNaturalWidth(row) / CANVAS_W) * 100;
}

// ---- CollageTile ----

const btnSm: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: '2px 7px',
  borderRadius: 3,
  fontSize: 11,
  lineHeight: 1.4,
};

interface TileProps {
  tile: TileState;
  onFrame: (n: number) => void;
  onRemove: () => void;
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
  focusMode: boolean;
}

function CollageTile({ tile, onFrame, onRemove, onMove, focusMode }: TileProps) {
  const w = tileW(tile.gif);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const decoderRef = useRef<any>(null);
  const frameCountRef = useRef(1);
  const [frameCount, setFrameCount] = useState(1);
  const [loading, setLoading] = useState(true);

  async function drawFrame(fi: number) {
    const dec = decoderRef.current;
    const canvas = canvasRef.current;
    if (!dec || !canvas) return;
    try {
      const { image } = await dec.decode({ frameIndex: fi });
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0, w, TILE_H);
      image.close();
    } catch (e) {
      console.warn('drawFrame failed', fi, e);
    }
  }

  // Load decoder when gif changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const initialFrame = tile.frameIndex;

    (async () => {
      const [arrayBuf, infoRes] = await Promise.all([
        fetch(tile.gif.src).then((r) => r.arrayBuffer()),
        fetch(`/__gif-info?src=${encodeURIComponent(tile.gif.src)}`).then((r) => r.json()),
      ]);
      if (cancelled) return;
      const type = tile.gif.src.endsWith('.gif') ? 'image/gif' : 'image/webp';
      const dec = new (window as any).ImageDecoder({ data: arrayBuf, type });
      await dec.completed;
      if (cancelled) return;
      decoderRef.current = dec;
      const fc: number = (infoRes as { frameCount: number }).frameCount;
      frameCountRef.current = fc;
      setFrameCount(fc);
      setLoading(false);
      await drawFrame(initialFrame);
    })().catch(console.error);

    return () => {
      cancelled = true;
      decoderRef.current = null;
    };
  }, [tile.gif.src]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw directly on button click — don't wait for React render cycle
  const seek = (delta: number) => {
    const fi = Math.min(frameCountRef.current - 1, Math.max(0, tile.frameIndex + delta));
    onFrame(fi);
    drawFrame(fi);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: TILE_H,
        flexShrink: 0,
        background: '#111',
        outline: '1px solid #222',
      }}
    >
      <canvas ref={canvasRef} width={w} height={TILE_H} style={{ display: 'block' }} />

      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555',
            fontSize: 11,
          }}
        >
          loading…
        </div>
      )}

      {!focusMode && (
        <>
          {/* Top: move + remove */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '2px 4px',
            }}
          >
            <button onClick={() => onMove('left')} style={btnSm}>
              ←
            </button>
            <button onClick={() => onMove('up')} style={btnSm}>
              ↑
            </button>
            <button onClick={() => onMove('down')} style={btnSm}>
              ↓
            </button>
            <button onClick={() => onMove('right')} style={btnSm}>
              →
            </button>
            <button onClick={onRemove} style={{ ...btnSm, marginLeft: 4, color: '#f88' }}>
              ✕
            </button>
          </div>
          {/* Bottom: frame controls */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '2px 4px',
            }}
          >
            <button onClick={() => seek(-10)} style={btnSm}>
              «
            </button>
            <button onClick={() => seek(-1)} style={btnSm}>
              ◀
            </button>
            <span style={{ color: '#aaa', minWidth: 40, textAlign: 'center', fontSize: 10 }}>
              {tile.frameIndex}/{frameCount - 1}
            </span>
            <button onClick={() => seek(1)} style={btnSm}>
              ▶
            </button>
            <button onClick={() => seek(10)} style={btnSm}>
              »
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---- EmptyRow ----

function EmptyRow({ rowIdx }: { rowIdx: number }) {
  return (
    <div
      style={{
        height: TILE_H,
        border: '1px dashed #2a2a2a',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        color: '#383838',
        fontSize: 12,
        flexShrink: 0,
      }}
    >
      Row {rowIdx + 1} — click a GIF in the sidebar to add
    </div>
  );
}

// ---- CollageBuilder ----

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#ccc',
  cursor: 'pointer',
  padding: '4px 10px',
  borderRadius: 4,
  fontSize: 12,
};

const activeBtn: React.CSSProperties = {
  ...btnStyle,
  background: '#3a7edb',
  borderColor: '#3a7edb',
  color: '#fff',
  fontWeight: 600,
};

/**
 * Capture tile canvases from the layout container.
 * cropXPx: horizontal pixel offset of the crop window (in container coords).
 * The crop window spans full height and is CANVAS_W/contentH * contentH wide.
 */
function captureFromDOM(container: HTMLElement, cropXPx: number): HTMLCanvasElement {
  const rect = container.getBoundingClientRect();
  const canvases = container.querySelectorAll('canvas');
  const sx = container.scrollLeft;
  const sy = container.scrollTop;

  // Find content bounds
  let minY = Infinity,
    maxY = 0;
  canvases.forEach((c) => {
    const r = c.getBoundingClientRect();
    const cy = r.top - rect.top + sy;
    minY = Math.min(minY, cy);
    maxY = Math.max(maxY, cy + r.height);
  });
  if (!canvases.length) return document.createElement('canvas');

  const contentH = maxY - minY;
  // Output at OG image aspect ratio: 1200×630
  const outputW = CANVAS_W;
  const outputH = 630;
  // How wide is the crop window in container pixels?
  const cropWPx = contentH * (outputW / outputH);
  const scaleX = outputW / cropWPx;
  const scaleY = outputH / contentH;

  const offscreen = document.createElement('canvas');
  offscreen.width = outputW;
  offscreen.height = outputH;
  const ctx = offscreen.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, outputW, outputH);

  canvases.forEach((canvas) => {
    const r = canvas.getBoundingClientRect();
    const cx = r.left - rect.left + sx;
    const cy = r.top - rect.top + sy;
    const x = (cx - cropXPx) * scaleX;
    const y = (cy - minY) * scaleY;
    const w = r.width * scaleX;
    const h = r.height * scaleY;
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, w, h);
  });

  return offscreen;
}

export function CollageBuilder() {
  const allTags = collectTags(gifs, (g) => g.tags);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [rows, setRows] = useState<Rows>([[], [], []]);
  const [rowOffsets, setRowOffsets] = useState<[number, number, number]>([0, 0, 0]);
  const [activeRow, setActiveRow] = useState<0 | 1 | 2>(0);
  const [focusMode, setFocusMode] = useState(false);
  const [cropX, setCropX] = useState(0); // horizontal offset of crop window in focus mode
  const layoutRef = useRef<HTMLDivElement>(null);

  const filtered = activeTag ? gifs.filter((g) => g.tags?.includes(activeTag)) : gifs;
  const usedSlugs = new Set(rows.flat().map((t) => t.gif.slug));

  const addGif = (gif: Gif) => {
    setRows((prev) => {
      if (prev[activeRow].some((t) => t.gif.slug === gif.slug)) return prev;
      const next = prev.map((r) => [...r]) as Rows;
      next[activeRow] = [...next[activeRow], { gif, frameIndex: 0 }];
      return next;
    });
  };

  const moveTile = (rowIdx: number, tileIdx: number, dir: 'left' | 'right' | 'up' | 'down') => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]) as Rows;
      const tile = next[rowIdx]![tileIdx]!;
      if (dir === 'left' && tileIdx > 0) {
        next[rowIdx]!.splice(tileIdx, 1);
        next[rowIdx]!.splice(tileIdx - 1, 0, tile);
      } else if (dir === 'right' && tileIdx < next[rowIdx]!.length - 1) {
        next[rowIdx]!.splice(tileIdx, 1);
        next[rowIdx]!.splice(tileIdx + 1, 0, tile);
      } else if (dir === 'up' && rowIdx > 0) {
        next[rowIdx]!.splice(tileIdx, 1);
        next[rowIdx - 1]!.push(tile);
      } else if (dir === 'down' && rowIdx < 2) {
        next[rowIdx]!.splice(tileIdx, 1);
        next[rowIdx + 1]!.push(tile);
      }
      return next;
    });
  };

  const removeGif = (rowIdx: number, tileIdx: number) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]) as Rows;
      next[rowIdx] = next[rowIdx]!.filter((_, i) => i !== tileIdx);
      return next;
    });
  };

  const setFrame = (rowIdx: number, tileIdx: number, fi: number) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]) as Rows;
      next[rowIdx] = next[rowIdx]!.map((t, i) => (i === tileIdx ? { ...t, frameIndex: fi } : t));
      return next;
    });
  };

  const randomize = () => {
    setRows((prev) => {
      const all = [...prev.flat()].sort(() => Math.random() - 0.5);
      const base = Math.floor(all.length / 3);
      const rem = all.length % 3;
      // distribute evenly: first `rem` rows get one extra
      const sizes = [base + (rem > 0 ? 1 : 0), base + (rem > 1 ? 1 : 0), base];
      let i = 0;
      return sizes.map((n) => all.slice(i, (i += n))) as Rows;
    });
  };

  const clearAll = () => setRows([[], [], []]);

  const importConfig = () => {
    const raw = prompt('Paste rows config (JSON array of arrays of slugs):');
    if (!raw) return;
    try {
      const gifBySlug = new Map(gifs.map((g) => [g.slug, g]));
      // Accept either a bare array or an object with a `rows` key
      const parsed = JSON.parse(raw);
      const rowSlugs: string[][] = Array.isArray(parsed) ? parsed : parsed.rows;
      const overrides: Record<string, number> = parsed.frameOverrides ?? {};
      if (!Array.isArray(rowSlugs) || rowSlugs.length !== 3) {
        alert('Expected an array of 3 rows');
        return;
      }
      const next = rowSlugs.map((slugs) =>
        slugs.flatMap((slug) => {
          const gif = gifBySlug.get(slug);
          if (!gif) {
            console.warn(`Unknown slug: ${slug}`);
            return [];
          }
          return [{ gif, frameIndex: overrides[slug] ?? 0 }];
        }),
      ) as Rows;
      setRows(next);
    } catch {
      alert('Invalid JSON');
    }
  };

  const copyConfig = () => {
    const rowSlugs = rows.map((r) => r.map((t) => t.gif.slug));
    const overrides: Record<string, number> = {};
    rows.forEach((r) =>
      r.forEach((t) => {
        if (t.frameIndex !== 0) overrides[t.gif.slug] = t.frameIndex;
      }),
    );
    const payload: Record<string, unknown> = { rows: rowSlugs };
    if (Object.keys(overrides).length) payload.frameOverrides = overrides;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert('Copied to clipboard');
  };

  const capture = (mode: 'clipboard' | 'download') => {
    if (!layoutRef.current) return;
    const offscreen = captureFromDOM(layoutRef.current, cropX);
    if (mode === 'clipboard') {
      // Clipboard API only accepts image/png
      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          alert('Copied to clipboard');
        } catch (e) {
          alert(`Clipboard failed: ${e}`);
        }
      }, 'image/png');
    } else {
      offscreen.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'collage.jpg';
          a.click();
          URL.revokeObjectURL(url);
        },
        'image/jpeg',
        0.9,
      );
    }
  };

  // Brick offset = half width of first tile in row 1
  const brickOffset = rows[1][0] ? Math.round(tileW(rows[1][0].gif) / 2) : 0;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#080808',
        color: '#fff',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      {/* ---- Sidebar ---- */}
      {!focusMode && (
        <div
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Row selector */}
          <div
            style={{ padding: '10px 10px 0', borderBottom: '1px solid #1a1a1a', paddingBottom: 10 }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#555',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Adding to
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {([0, 1, 2] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveRow(i)}
                  style={activeRow === i ? activeBtn : btnStyle}
                  title={`Fill row ${i + 1}`}
                >
                  R{i + 1}
                  <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>
                    ({rows[i].length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            <button
              onClick={() => setActiveTag(null)}
              style={!activeTag ? activeBtn : { ...btnStyle, fontSize: 11, padding: '2px 7px' }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={
                  activeTag === tag
                    ? { ...activeBtn, fontSize: 11, padding: '2px 7px' }
                    : { ...btnStyle, fontSize: 11, padding: '2px 7px' }
                }
              >
                {tag}
              </button>
            ))}
          </div>

          {/* GIF list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((gif) => {
              const inUse = usedSlugs.has(gif.slug);
              return (
                <button
                  key={gif.slug}
                  onClick={() => addGif(gif)}
                  title={`${gif.width}×${gif.height}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: inUse ? 'rgba(58,126,219,0.18)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #111',
                    color: inUse ? '#7ab0f0' : '#aaa',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    fontSize: 11,
                  }}
                >
                  {gif.slug}
                  <span style={{ color: '#383838', marginLeft: 6 }}>
                    {gif.width}×{gif.height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Main ---- */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Toolbar */}
        {!focusMode && (
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <button onClick={copyConfig} style={btnStyle}>
              Copy config
            </button>
            <button onClick={importConfig} style={btnStyle}>
              Import config
            </button>
            <button onClick={randomize} style={btnStyle}>
              Shuffle all
            </button>
            <button onClick={clearAll} style={{ ...btnStyle, color: '#f88' }}>
              Clear
            </button>
            <div style={{ flex: 1 }} />
            {/* Fill % indicators */}
            {rows.map((row, i) => {
              const pct = fillPct(row);
              const ok = row.length === 0 || pct >= FILL_WARN * 100;
              return (
                <span key={i} style={{ fontSize: 11, color: ok ? '#555' : '#e8a000' }}>
                  R{i + 1}: {row.length === 0 ? '—' : `${pct.toFixed(0)}%`}
                </span>
              );
            })}
            <button onClick={() => capture('clipboard')} style={{ ...btnStyle, marginLeft: 8 }}>
              Copy image
            </button>
            <button onClick={() => capture('download')} style={btnStyle}>
              Download
            </button>
            <button onClick={() => setFocusMode(true)} style={btnStyle}>
              Focus ↗
            </button>
          </div>
        )}

        {/* Focus mode controls */}
        {focusMode && (
          <div
            style={{
              position: 'fixed',
              top: 10,
              right: 10,
              zIndex: 100,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="range"
              min={-500}
              max={500}
              value={cropX}
              onChange={(e) => setCropX(Number(e.target.value))}
              style={{ width: 200 }}
              title={`Crop offset: ${cropX}px`}
            />
            <button onClick={() => capture('clipboard')} style={btnStyle}>
              Copy
            </button>
            <button onClick={() => capture('download')} style={btnStyle}>
              Save
            </button>
            <button onClick={() => setFocusMode(false)} style={btnStyle}>
              ✕
            </button>
          </div>
        )}

        {/* Brick layout */}
        <div
          ref={layoutRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: focusMode ? 0 : 24,
            display: 'flex',
            flexDirection: 'column',
            gap: focusMode ? 0 : 4,
            position: 'relative',
          }}
        >
          {/* Crop box overlay in focus mode */}
          {focusMode && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: cropX,
                width: TILE_H * 3 * (CANVAS_W / 630),
                height: TILE_H * 3,
                border: '2px solid rgba(74,158,255,0.8)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          )}
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} style={{ flexShrink: 0 }}>
              {row.length === 0 && !focusMode ? (
                <EmptyRow rowIdx={rowIdx} />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginLeft: (rowIdx === 1 ? brickOffset : 0) + (rowOffsets[rowIdx] ?? 0),
                    flexWrap: 'nowrap',
                  }}
                >
                  {row.map((tile, tileIdx) => (
                    <CollageTile
                      key={tile.gif.slug}
                      tile={tile}
                      focusMode={focusMode}
                      onFrame={(fi) => setFrame(rowIdx, tileIdx, fi)}
                      onRemove={() => removeGif(rowIdx, tileIdx)}
                      onMove={(dir) => moveTile(rowIdx, tileIdx, dir)}
                    />
                  ))}
                </div>
              )}

              {!focusMode && row.length > 0 && (
                <div
                  style={{
                    fontSize: 10,
                    color: '#383838',
                    marginTop: 2,
                    paddingLeft: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>
                    Row {rowIdx + 1} · {row.length} tiles · {fillPct(row).toFixed(1)}% fill
                    {fillPct(row) < FILL_WARN * 100 && (
                      <span style={{ color: '#e8a000', marginLeft: 6 }}>⚠ add more tiles</span>
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setRowOffsets((p) => {
                        const n = [...p] as [number, number, number];
                        n[rowIdx] = (n[rowIdx] ?? 0) - 10;
                        return n;
                      })
                    }
                    style={{ ...btnSm, fontSize: 10, padding: '0 4px' }}
                  >
                    ←
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center' }}>
                    {rowOffsets[rowIdx] ?? 0}
                  </span>
                  <button
                    onClick={() =>
                      setRowOffsets((p) => {
                        const n = [...p] as [number, number, number];
                        n[rowIdx] = (n[rowIdx] ?? 0) + 10;
                        return n;
                      })
                    }
                    style={{ ...btnSm, fontSize: 10, padding: '0 4px' }}
                  >
                    →
                  </button>
                  <button
                    onClick={() =>
                      setRowOffsets((p) => {
                        const n = [...p] as [number, number, number];
                        n[rowIdx] = 0;
                        return n;
                      })
                    }
                    style={{ ...btnSm, fontSize: 10, padding: '0 4px', color: '#888' }}
                  >
                    reset
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
