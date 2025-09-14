"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";

export default function QuestionsPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setCurrentSlide(2);
  };

  const handleLevelSelect = (level: number) => {
    if (level <= 3) {
      setSelectedLevel(level);
      setCurrentSlide(3);
    }
  };

  const handleReasonSelect = (reason: string) => {
    if (reason === "I’m under a lot of pressure right now.") {
      setSelectedReason(reason);
      // Navigate to modal after completing all questions
      router.push("/modal");
    }
  };

  const handleBack = () => {
    if (currentSlide === 1) {
      router.push("/notification");
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />

        <div className="relative z-10 h-dvh px-4 pt-[1rem] pb-[3.125rem]">
          <div className="h-full w-full flex flex-col">
            <div className="flex gap-[0.938rem] mb-[3.375rem] items-center">
              <BackButton onClick={handleBack} />
              <span className="font-bold text-2xl">Discover</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-[30px]">
              <div className="w-full h-[10px] bg-white/10 rounded-[12px] overflow-hidden">
                <div
                  className="h-full bg-white rounded-[12px] transition-all duration-300 ease-out"
                  style={{ width: `${(currentSlide / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Slide 1: Theme Selection */}
            {currentSlide === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-[30px] min-h-[44px] mt-[30px]">
                  <h2 className="text-[20px] leading-[24px] font-medium text-white">
                    What do you want to focus on today?
                  </h2>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <button
                    onClick={() => handleThemeSelect("Competitiveness")}
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[18px] font-medium">
                      Competitiveness
                    </span>
                  </button>

                  <button
                    onClick={() => handleThemeSelect("Drive")}
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[18px] font-medium">Drive</span>
                  </button>

                  <button
                    onClick={() => handleThemeSelect("Motivation")}
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[18px] font-medium">Motivation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Slide 2: High/Low Route Selection */}
            {currentSlide === 2 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-[30px] min-h-[44px] mt-[30px]">
                  <h2 className="text-[20px] leading-[24px] font-medium text-white">
                    How are you feeling about your Drive today? (for the purpose
                    of this demo, select something 3 or lower)
                  </h2>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <button
                    onClick={() => handleLevelSelect(5)}
                    className="w-full flex items-center px-[15px] h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="w-[28px] h-[28px] inline-flex items-center justify-center bg-[#353535] rounded-full mr-2.5 font-bold text-[14px] text-[#FFFFFF80]">
                      5
                    </span>
                    <span className="text-[16px] text-white">
                      I’m hungry to compete and chase growth.
                    </span>
                  </button>

                  <button
                    onClick={() => handleLevelSelect(4)}
                    className="w-full flex items-center px-[15px] h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="w-[28px] h-[28px] inline-flex items-center justify-center bg-[#353535] rounded-full mr-2.5 font-bold text-[14px] text-[#FFFFFF80]">
                      4
                    </span>
                    <span className="text-[16px] text-white">
                      I’m motivated and pushing myself most days.
                    </span>
                  </button>

                  <button
                    onClick={() => handleLevelSelect(3)}
                    className="w-full flex items-center px-[15px] h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="w-[28px] h-[28px] inline-flex items-center justify-center bg-[#353535] rounded-full mr-2.5 font-bold text-[14px] text-[#FFFFFF80]">
                      3
                    </span>
                    <span className="text-[16px] text-white">
                      My drive comes and goes.
                    </span>
                  </button>

                  <button
                    onClick={() => handleLevelSelect(2)}
                    className="w-full flex px-[15px] items-center h-[60px] bg-[#FFFFFF26] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="w-[28px] h-[28px] inline-flex items-center justify-center bg-[#353535] rounded-full mr-2.5 font-bold text-[14px] text-[#FFFFFF80]">
                      2
                    </span>
                    <span className="text-[16px] text-white">
                      I’ve been showing up flat or coasting.
                    </span>
                  </button>

                  <button
                    onClick={() => handleLevelSelect(1)}
                    className="w-full flex items-center px-[15px] h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="w-[28px] h-[28px] inline-flex items-center justify-center bg-[#353535] rounded-full mr-2.5 font-bold text-[14px] text-[#FFFFFF80]">
                      1
                    </span>
                    <span className="text-[16px] text-white">
                      I don’t feel much fire to go after it right now.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Slide 3: Performance Reason */}
            {currentSlide === 3 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-[30px] min-h-[44px] mt-[30px]">
                  <h2 className="text-[20px] leading-[24px] font-medium text-white">
                    What’s getting in the way of stronger Drive today? (for the
                    purpose of this demo, select pressure)
                  </h2>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <button
                    onClick={() =>
                      handleReasonSelect("I just suffered a setback.")
                    }
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[16px]">
                      I just suffered a setback.
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleReasonSelect("I’m feeling off or unmotivated. ")
                    }
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[16px]">
                      I’m feeling off or unmotivated.{" "}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleReasonSelect(
                        "I’m under a lot of pressure right now."
                      )
                    }
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF26] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[16px] ">
                      I’m under a lot of pressure right now.{" "}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleReasonSelect("I’m not where I want to be.")
                    }
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[16px]">
                      I’m not where I want to be.
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleReasonSelect(
                        "I’m frustrated with people around me."
                      )
                    }
                    className="w-full flex items-center justify-center h-[60px] bg-[#FFFFFF0A] active:bg-[#FFFFFF26] border border-[#FFFFFF33] rounded-[30px] text-white transition-all"
                  >
                    <span className="text-[16px]">
                      I’m frustrated with people around me.
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
