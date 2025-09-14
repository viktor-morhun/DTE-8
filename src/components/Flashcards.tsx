"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { twMerge } from "tailwind-merge";

import "swiper/css";
import "swiper/css/pagination";
import FlashCardSlide from "./FlashCardSlide";
import SwipeIcon from "./icons/SwipeIcon";

export type FlashcardsContent = {
  id: string;
  type: "video" | "timer" | "text" | "input" | "audio" | "game-input" | "game";
  title?: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  posterUrl?: string;
  backgroundImage?: string;
};

type FlashcardsProps = {
  cards: FlashcardsContent[];
  onComplete?: () => void;
  onSlideChange?: (index: number) => void;
  className?: string;
};

export default function Flashcards({
  cards,
  onComplete,
  onSlideChange,
  className,
}: FlashcardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [gameInputValue, setGameInputValue] = useState("");
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  // ===== SFX swipe =====
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const skipFirstSlideChangeRef = useRef(true);

  useEffect(() => {
    // подгружаем короткий звук свайпа (положи файл в /public/swipe.mp3)
    const a = new Audio("/swipe.mp3");
    a.preload = "auto";
    a.volume = 0.45;
    sfxRef.current = a;
    return () => {
      if (sfxRef.current) {
        // на всякий случай останавливаем
        try {
          sfxRef.current.pause();
        } catch {}
        sfxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const unlockOnce = async () => {
      if (audioUnlockedRef.current || !sfxRef.current) return;
      try {
        // короткий «тихий» запуск для разблокировки в iOS
        sfxRef.current.muted = true;
        await sfxRef.current.play();
        sfxRef.current.pause();
        sfxRef.current.currentTime = 0;
        sfxRef.current.muted = false;
        audioUnlockedRef.current = true;
      } catch {
        // ignore — попробуем ещё на следующий жест
      }
    };

    const onPointerDown = () => unlockOnce();
    const onWheel = () => unlockOnce();
    const onKeyDown = () => unlockOnce();

    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const playSwipeSfx = () => {
    const a = sfxRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      // не используем await, чтобы не блокировать UI
      void a.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentCardIndex(swiper.activeIndex);
    onSlideChange?.(swiper.activeIndex);
    
    // Reset audio and video started states when changing slides
    setAudioStarted(false);
    setVideoStarted(false);
    
    // For audio cards, simulate audio start after a short delay
    const newCard = cards[swiper.activeIndex];
    if (newCard?.type === "audio") {
      setTimeout(() => {
        setAudioStarted(true);
      }, 1500); // Show swipe icon after 1.5 seconds for audio cards
    }

    // Enable/disable swiper controls based on card type
    if (newCard?.type === "game") {
      // Disable swiper controls for game cards
      swiper.allowTouchMove = false;
      swiper.mousewheel.disable();
      swiper.keyboard.disable();
    } else {
      // Enable swiper controls for other cards
      swiper.allowTouchMove = true;
      swiper.mousewheel.enable();
      swiper.keyboard.enable();
    }

    // Пропускаем первый вызов, чтобы не сыграть звук на инициализации
    if (skipFirstSlideChangeRef.current) {
      skipFirstSlideChangeRef.current = false;
      return;
    }
    playSwipeSfx();
  };

  const handleSlideChangeTransitionEnd = (swiper: SwiperType) => {
    // If we've swiped past the last slide, navigate to completion page
    if (swiper.activeIndex >= cards.length) {
      onComplete?.();
    }
  };

  const handleTouchEnd = (swiper: SwiperType) => {
    const currentCard = cards[swiper.activeIndex];
    // Don't auto-navigate for input and game-input cards - they need manual submit
    if (currentCard?.type === "input" || currentCard?.type === "game-input") {
      return;
    }
    
    // Only navigate to next page if we're on the last slide and trying to swipe further
    if (swiper.activeIndex === cards.length - 1) {
      const translate = swiper.translate;
      const maxTranslate = swiper.maxTranslate();
      
      // If user swiped beyond the last slide
      if (translate < maxTranslate - 50) {
        setTimeout(() => {
          onComplete?.();
        }, 200);
      }
    }
  };

  if (!cards.length) return null;

  const activeCard = cards[currentCardIndex];
  // если на input или game-input карточке виден Submit, приподнимем иконку
  const showSubmit =
    (activeCard?.type === "input" && inputValue.trim().length > 0) ||
    (activeCard?.type === "game-input" && gameInputValue.trim().length > 0);

  // Show swipe icon logic: exclude input and game-input cards
  // For audio cards, only show after audio started and only on first 2 slides
  // For video cards, show after video started on any slide
  // For other card types, show only on first 2 slides
  // Always show on last slide (4th slide) for navigation to next page
  const shouldShowSwipe = activeCard?.type !== "input" && activeCard?.type !== "game-input" && (
    (activeCard?.type === "audio" && audioStarted && currentCardIndex <= 1) ||
    (activeCard?.type === "video" && videoStarted) ||
    (activeCard?.type !== "audio" && activeCard?.type !== "video" && currentCardIndex <= 1) ||
    (currentCardIndex === cards.length - 1) // Always show on the 4th (last) slide
  );

  return (
    <section
      ref={containerRef}
      className={twMerge("h-full outline-none", className)}
      // чтобы ловить keydown для разблокировки — делаем контейнер focusable
      tabIndex={0}
    >
      <Swiper
        direction='vertical'
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={{ enabled: true, forceToAxis: true }}
        keyboard={{ enabled: true }}
        modules={[Pagination, Mousewheel, Keyboard]}
        onSwiper={setSwiperInstance}
        onSlideChange={handleSlideChange}
        onSlideChangeTransitionEnd={handleSlideChangeTransitionEnd}
        onTouchEnd={handleTouchEnd}
        onReachEnd={() => {
          const currentCard = cards[currentCardIndex];
          // Don't auto-navigate for input and game-input cards - they need manual submit
          if (currentCard?.type === "input" || currentCard?.type === "game-input") {
            return;
          }
          // Only navigate if we're on the last slide
          if (currentCardIndex === cards.length - 1) {
            setTimeout(() => {
              onComplete?.();
            }, 300);
          }
        }}
        className='h-full'
        style={
          {
            "--swiper-pagination-color": "#ffffff",
            "--swiper-pagination-bullet-inactive-color": "#ffffff40",
          } as React.CSSProperties
        }
      >
        {cards.map((card, index) => (
          <SwiperSlide key={card.id} className='h-full px-4'>
            <FlashCardSlide
              card={card}
              isActive={index === currentCardIndex}
              index={index}
              cardsLength={cards.length}
              inputValue={inputValue}
              gameInputValue={gameInputValue}
              onInputChange={setInputValue}
              onGameInputChange={setGameInputValue}
              swiper={swiperInstance}
              onComplete={onComplete}
              onAudioStart={() => setAudioStarted(true)}
              onVideoStart={() => setVideoStarted(true)}
              onSubmit={() => {
                // Re-enable swiper controls when game completes
                if (swiperInstance) {
                  swiperInstance.allowTouchMove = true;
                  swiperInstance.mousewheel.enable();
                  swiperInstance.keyboard.enable();
                }
                
                if (index === cards.length - 1) {
                  // Если это последняя карточка, завершаем
                  onComplete?.();
                } else {
                  // Иначе переходим к следующему слайду
                  swiperInstance?.slideNext();
                }
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Глобальная свайп-иконка: всегда поверх, центр по ширине */}
      {shouldShowSwipe && (
        <div
          className='pointer-events-none fixed z-[1001] left-0 right-0 flex justify-center'
          style={{
            bottom: `calc(env(safe-area-inset-bottom, 0px) + ${
              showSubmit ? 86 : 18
            }px)`,
          }}
        >
          <SwipeIcon />
        </div>
      )}
    </section>
  );
}
