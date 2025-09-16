"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { twMerge } from "tailwind-merge";
import BackButton from "@/components/ui/BackButton";
import StarButton from "@/components/ui/StarButton";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import ChatIcon from "@/components/icons/ChatIcon";

const EASE = cubicBezier(0.22, 1, 0.36, 1);

function RatingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get score data from URL params
  const hiteScore = parseInt(searchParams.get("hiteScore") || "0");
  const pointsEarned = parseInt(searchParams.get("pointsEarned") || "0");
  const wasCorrect = searchParams.get("wasCorrect") === "true";

  const [currentSlide, setCurrentSlide] = useState(1);
  const [helpfulRating, setHelpfulRating] = useState(0);
  const [engagingRating, setEngagingRating] = useState(0);
  const [lengthFeedback, setLengthFeedback] = useState<string>("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [userName, setUserName] = useState("");

  const handleBack = () => {
    if (currentSlide === 1) {
      router.push("/score");
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = async () => {
    if (currentSlide === 1) {
      setCurrentSlide(2);
    } else {
      // Save rating data to Google Sheets
      console.log("Attempting to save rating data...");
      console.log("Data to send:", {
        helpfulRating,
        engagingRating,
        lengthFeedback,
        daysPerWeek,
        additionalFeedback,
        userName,
      });

      try {
        const response = await fetch("/api/save-rating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            helpfulRating,
            engagingRating,
            lengthFeedback,
            daysPerWeek,
            additionalFeedback,
            userName,
          }),
        });

        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Response data:", result);

        if (!response.ok) {
          throw new Error("Failed to save rating");
        }

        console.log("Rating saved successfully");
      } catch (error) {
        console.error("Error saving rating:", error);
        // Continue to next page even if saving fails
      }

      // Pass score data to final page
      const params = new URLSearchParams({
        hiteScore: hiteScore.toString(),
        pointsEarned: pointsEarned.toString(),
        wasCorrect: wasCorrect.toString(),
      });

      router.push(`/final?${params.toString()}`);
    }
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />

        <div className="relative z-10 min-h-dvh px-4 pt-[24px] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col">
          <section className={twMerge("flex-1 flex flex-col")}>
            <BackButton onClick={handleBack} className="mt-1 mb-2" />

            {currentSlide === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="mx-auto mb-6">
                  <ChatIcon />
                </div>
                <div className="text-center mb-10">
                  <h1 className="font-bold text-[32px]">
                    How would you rate this training?
                  </h1>
                </div>

                {/* Question 1: How helpful was the information? */}
                <div className="mb-10">
                  <h2 className="text-[16px] text-[#FFFFFFCC] text-center mb-3">
                    How helpful was the information?
                  </h2>
                  <div className="flex justify-center items-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarButton
                        key={`helpful-${star}`}
                        onClick={() => setHelpfulRating(star)}
                        active={star <= helpfulRating}
                      />
                    ))}
                  </div>
                </div>

                {/* Question 2: How engaging was the presentation? */}
                <div className="mb-10 max-w-[360px] mx-auto">
                  <h2 className="text-[16px] text-[#FFFFFFCC] text-center mb-3">
                    How engaging was the presentation of the content?
                  </h2>
                  <div className="flex justify-center items-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarButton
                        key={`engaging-${star}`}
                        onClick={() => setEngagingRating(star)}
                        active={star <= engagingRating}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="flex-1 flex flex-col">
                {/* Question 3: What did you think of the length? */}
                <div className="mb-10">
                  <h2 className="text-[16px] mt-4 text-[#FFFFFFCC] mb-3">
                    What did you think of the length?
                  </h2>
                  <div className="flex flex-col gap-3">
                    {["Too Long", "Just Right", "Too Short"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setLengthFeedback(option)}
                        className={`w-full h-[40px] rounded-[30px] bg-[#FFFFFF0A] border text-[14px] font-medium text-white  transition-all ${
                          lengthFeedback === option
                            ? "border-white"
                            : " border-[#FFFFFF33]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4: How many days a week */}
                <div className="mb-10">
                  <h2 className="text-[16px] text-[#FFFFFFCC] mb-6">
                    How many days a week could you see yourself doing trainings
                    like this?
                  </h2>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <button
                        key={day}
                        onClick={() => setDaysPerWeek(day)}
                        className={`w-[34px] h-[34px] rounded-full transition-all text-[17px] font-bold ${
                          daysPerWeek === day
                            ? "bg-white text-black"
                            : "bg-[#353535] text-[#FFFFFF80]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 5: Additional feedback */}
                <div className="mb-6">
                  <h2 className="text-[14px] leading-[20px] text-[#FFFFFFCC] mb-1">
                    Anything else you&apos;d like to share
                  </h2>
                  <TextArea
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    placeholder="Type your answer..."
                    className="h-[80px]"
                    size="sx"
                  />
                </div>

                {/* Question 6: Name */}
                <div className="mb-6">
                  <h2 className="text-[14px] leading-[20px] text-[#FFFFFFCC] mb-1">
                    Please enter your name
                  </h2>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-[16px] h-[48px] px-4 rounded-[4px] bg-[#FFFFFF0A] border border-[#FFFFFF4D] text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Кнопка внизу */}
          <div className="mt-auto pt-8">
            <Button
              onClick={handleNext}
              className="h-15 w-full"
              disabled={currentSlide === 1 && (helpfulRating === 0 || engagingRating === 0)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingRating() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />
        <div className="relative z-10 h-dvh flex items-center justify-center">
          <div className="text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RatingPage() {
  return (
    <Suspense fallback={<LoadingRating />}>
      <RatingContent />
    </Suspense>
  );
}
  