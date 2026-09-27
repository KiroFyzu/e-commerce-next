"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProductImage } from "@/components/site/ProductImage";
import { ChevronLeftIcon, ChevronRightIcon, XIcon, PlusIcon, MinusIcon } from "@/components/icons";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;
const TAP_ZOOM_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;
const SWIPE_THRESHOLD_PX = 50;

type Pan = { x: number; y: number };

export function ImageLightbox({
  images,
  alt,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [prevIndex, setPrevIndex] = useState(index);
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef(0);
  const hasMultiple = images.length > 1;
  const zoomed = scale > 1;

  // Reset zoom/pan whenever the displayed image changes, adjusted during
  // render (React's recommended pattern) rather than in an effect so the
  // zoomed-out state is what the browser paints, not a stale zoomed frame.
  if (index !== prevIndex) {
    setPrevIndex(index);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }

  // createPortal needs a real document; deferring to an effect keeps the
  // client's first render matching the server's (no portal) before mounting.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      onIndexChange((nextIndex + images.length) % images.length);
    },
    [images.length, onIndexChange]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMultiple) goTo(index - 1);
      if (e.key === "ArrowRight" && hasMultiple) goTo(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, hasMultiple, onClose, goTo]);

  function clampPan(next: Pan, currentScale: number): Pan {
    const el = frameRef.current;
    if (!el) return next;
    const { width, height } = el.getBoundingClientRect();
    const maxX = ((currentScale - 1) * width) / 2;
    const maxY = ((currentScale - 1) * height) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function setClampedScale(next: number) {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(clamped);
    if (clamped === MIN_SCALE) setPan({ x: 0, y: 0 });
    else setPan((p) => clampPan(p, clamped));
  }

  function toggleZoom() {
    setClampedScale(zoomed ? 1 : TAP_ZOOM_SCALE);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setClampedScale(scale - e.deltaY * 0.0015);
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (!zoomed) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPan(clampPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }, scale));
  }

  function endDrag() {
    dragRef.current = null;
    setIsDragging(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    if (zoomed) {
      dragRef.current = { x: touch.clientX, y: touch.clientY, panX: pan.x, panY: pan.y };
      setIsDragging(true);
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!zoomed || !dragRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.x;
    const dy = touch.clientY - dragRef.current.y;
    setPan(clampPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }, scale));
  }

  function handleTouchEnd(e: React.TouchEvent) {
    dragRef.current = null;
    setIsDragging(false);

    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < DOUBLE_TAP_MS;
    lastTapRef.current = now;
    if (isDoubleTap) {
      toggleZoom();
      touchStartRef.current = null;
      return;
    }

    if (!zoomed && touchStartRef.current) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      if (hasMultiple && Math.abs(dx) > SWIPE_THRESHOLD_PX) {
        goTo(dx > 0 ? index - 1 : index + 1);
      }
    }
    touchStartRef.current = null;
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — pratinjau gambar`}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <span className="text-sm text-white/70">{hasMultiple ? `${index + 1} / ${images.length}` : ""}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setClampedScale(scale - ZOOM_STEP)}
            disabled={scale <= MIN_SCALE}
            aria-label="Perkecil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setClampedScale(scale + ZOOM_STEP)}
            disabled={scale >= MAX_SCALE}
            aria-label="Perbesar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Gambar sebelumnya"
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer sm:left-4"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        <div
          ref={frameRef}
          className={`flex h-full w-full items-center justify-center p-6 ${
            zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          }`}
          style={{ touchAction: "none" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onDoubleClick={toggleZoom}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="h-full max-h-[80vh] w-full max-w-3xl select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
          >
            <ProductImage src={images[index]} alt={`${alt} ${index + 1}`} />
          </div>
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Gambar selanjutnya"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer sm:right-4"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 py-4">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Lihat gambar ${i + 1}`}
              aria-pressed={i === index}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <ProductImage src={src} alt={`${alt} thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
