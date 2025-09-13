"use client";

import Flashcards, { FlashcardsContent } from "@/components/Flashcards";
import PrefetchTranscripts from "@/components/PrefetchTranscripts";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

// универсальный хелпер: проверка, что у объекта есть строковое поле K
function hasString<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return (
    !!obj &&
    typeof obj === "object" &&
    typeof (obj as Record<K, unknown>)[key] === "string"
  );
}

// type guard для аудио-карточек (без any)
function isAudioCard(
  c: FlashcardsContent
): c is FlashcardsContent & { type: "audio"; audioUrl: string } {
  return c.type === "audio" && hasString(c, "audioUrl");
}

export default function FlashcardPage() {
  const router = useRouter();

  // Делаем массив карточек стабильным (одна и та же ссылка между рендерами)
  const flashcards = useMemo<FlashcardsContent[]>(
    () => [
      {
        id: "f1",
        type: "input",
        title:
          "Think about a moment where pressure threw off your mindset or your effort. What pulled you out of your rhythm?",
        content: "",
        backgroundImage: "/flashcard-bg.png",
      },
      {
        id: "f2",
        type: "game-input",
        title: "Reset Word Scramble Mini Game",
        content:
          "Choose one phrase you want to use under pressure. It can be something that helps you stay clear, steady, or locked in. Practice using it today when the moment feels rushed or too demanding.",
        backgroundImage: "/flashcard-bg.png",
      },
      { id: "f3", type: "game", backgroundImage: "/flashcard-bg.png" },
      {
        id: "f4",
        type: "text",
        title: "Releasing Pressure",
        content:
          "When pressure builds, your attention starts to shift. You might focus more on outcome, how others are doing, or what could go wrong. That shift can drain your drive. It makes it harder to stay connected to why you’re here and what matters most. Athletes who compete well under pressure usually have a way to bring their focus back to simple, personal anchors to stay connected with what they trust.",

        backgroundImage: "/flashcard-bg.png",
      },
    ],

    []
  );

  // Инициализируем фон сразу из первой карточки — без useEffect
  const [currentBgImage, setCurrentBgImage] = useState<string>(
    flashcards[0]?.backgroundImage || "/video-bg.png"
  );

  const handleSlideChange = (index: number) => {
    const newBg = flashcards[index]?.backgroundImage || "/video-bg.png";
    setCurrentBgImage(newBg);
  };

  const handleComplete = () => {
    router.push("/modal-finish");
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-full min-h-screen max-w-md relative overflow-hidden">
        <div className="absolute inset-0">
          {flashcards.map((card) => (
            <div
              key={card.id}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                card.backgroundImage === currentBgImage
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                backgroundImage: `url("${
                  card.backgroundImage || "/video-bg.png"
                }")`,
              }}
            />
          ))}
        </div>

        <div className="z-10">
          <div className="h-screen flex flex-col">
            <Flashcards
              cards={flashcards}
              onComplete={handleComplete}
              onSlideChange={handleSlideChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
