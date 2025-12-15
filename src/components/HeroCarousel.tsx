'use client';

import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

// 导入 Swiper 样式
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

import { DoubanItem } from '@/lib/types';

interface HeroCarouselProps {
  items: DoubanItem[];
  loading?: boolean;
}

export default function HeroCarousel({ items, loading = false }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 如果正在加载，显示骨架屏
  if (loading) {
    return (
      <div className="relative w-full h-[240px] sm:h-[340px] md:h-[420px] lg:h-[500px] mb-10 lg:mb-12 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="h-8 w-1/3 bg-gray-400/50 dark:bg-gray-600/50 rounded-lg animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-400/30 dark:bg-gray-600/30 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-400/40 dark:bg-gray-600/40 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // 如果没有数据，不渲染
  if (!items || items.length === 0) {
    return null;
  }

  // 取前5个热门项目作为轮播内容
  const carouselItems = items.slice(0, 5);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };


  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <div
      className="relative w-full h-[240px] sm:h-[340px] md:h-[420px] lg:h-[500px] mb-10 lg:mb-12 rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Swiper
        modules={[Autoplay, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={800}
        onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
        className="w-full h-full"
      >
        {carouselItems.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <Link href={`/search?query=${encodeURIComponent(item.title)}`} className="block w-full h-full">
              <div className="relative w-full h-full">
                {/* 背景图片 */}
                <div
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[8000ms] ease-out"
                  style={{
                    backgroundImage: `url(${item.poster})`,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* 内容区域 */}
                <div className="absolute inset-0 flex items-end pb-12 sm:pb-16 md:pb-20 px-4 sm:px-8 md:px-12">
                  <div className="max-w-2xl space-y-2 sm:space-y-4">
                    {/* 标签 */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.rate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-500/90 text-white text-xs sm:text-sm font-semibold rounded-full">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                          {item.rate}
                        </span>
                      )}
                      {item.year && (
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full">
                          {item.year}
                        </span>
                      )}
                    </div>

                    {/* 标题 */}
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight line-clamp-2 drop-shadow-lg">
                      {item.title}
                    </h2>

                    {/* 播放按钮 */}
                    <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                      <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm sm:text-base font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        立即播放
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右侧海报预览 (大屏幕显示) */}
                <div className="hidden lg:block absolute right-12 bottom-12 w-40 h-60 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-green-500/20">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-xl" />
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 导航按钮 - 使用 onClick 直接控制 */}
      <button
        ref={prevRef}
        onClick={handlePrev}
        className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 hover:bg-black/60 hover:scale-110 hover:border-white/40 ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}
        aria-label="上一张"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        ref={nextRef}
        onClick={handleNext}
        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 hover:bg-black/60 hover:scale-110 hover:border-white/40 ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}
        aria-label="下一张"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* 进度指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              swiperRef.current?.slideToLoop(index);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${activeIndex === index
              ? 'w-6 sm:w-8 bg-white shadow-lg'
              : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
              }`}
            aria-label={`跳转到第 ${index + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}
