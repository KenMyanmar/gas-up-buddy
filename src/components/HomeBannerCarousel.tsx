import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
}

const HomeBannerCarousel = () => {
  const { data: banners } = useQuery<Banner[]>({
    queryKey: ["home_banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_banners")
        .select("id, title, image_url, link_url")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Banner[];
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = banners?.length ?? 0;

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || count === 0) return;
      const width = el.offsetWidth;
      el.scrollTo({ left: width * index, behavior: "smooth" });
    },
    [count],
  );

  // Auto-rotate
  const startAutoRotate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
  }, [count, scrollToIndex]);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [startAutoRotate]);

  // Pause on touch
  const handleTouchStart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchEnd = () => {
    resumeTimerRef.current = setTimeout(() => startAutoRotate(), 3000);
  };

  // Track scroll position for dot indicator
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || count === 0) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIndex(index);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {banners.map((banner, i) => {
          const img = (
            <img
              src={banner.image_url}
              alt={banner.title ?? `Banner ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          );

          return (
            <div
              key={banner.id}
              className="w-full flex-shrink-0 snap-center"
              style={{ aspectRatio: "2 / 1" }}
            >
              {banner.link_url ? (
                <a href={banner.link_url} className="block h-full w-full">
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollToIndex(i);
                setActiveIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBannerCarousel;
