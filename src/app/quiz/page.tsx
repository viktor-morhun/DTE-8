"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/BackButton";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

export default function QuestionsPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [progress, setProgress] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [isFirstAnswerCorrect, setIsFirstAnswerCorrect] = useState<boolean | null>(null);
  
  // Define correct answers (0-indexed)
  const correctAnswers = {
    1: 1, // Second option is correct for question 1
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (showResults) return; // Prevent multiple clicks

    setSelectedAnswer(answerIndex);
    setShowResults(true);
    setAnimationTrigger((prev) => prev + 1); // Trigger animation
    
    // Save first question result
    if (currentSlide === 1) {
      setIsFirstAnswerCorrect(correctAnswers[1] === answerIndex);
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      setCurrentSlide(2);
      setProgress(2);
      // Reset for next question
      setSelectedAnswer(null);
      setShowResults(false);
      setAnimationTrigger(0);
    }, 1500);
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      // Create query params based on quiz results
      const params = new URLSearchParams({
        firstAnswer: isFirstAnswerCorrect ? 'correct' : 'incorrect',
        hasTextAnswer: 'true'
      });
      
      router.push(`/score?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentSlide === 1) {
      router.push("/modal-finish");
    } else {
      setCurrentSlide(currentSlide - 1);
      setProgress(1);
    }
  };

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setTextAnswer(value);

      // Устанавливаем прогресс только при переходах между состояниями
      if (value.trim() && progress < 4) {
        setProgress(4);
      } else if (!value.trim() && progress === 4) {
        setProgress(3);
      }
    },
    [progress]
  );

  const handleTextFocus = useCallback(() => {
    if (progress < 3) {
      setProgress(3);
    }
  }, [progress]);

  const handleTextBlur = useCallback(() => {
    // При расфокусе уменьшаем прогресс до 2, если нет текста
    if (!textAnswer.trim() && progress > 2) {
      setProgress(2);
    }
  }, [textAnswer, progress]);

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
              <span className="font-bold text-2xl">Execute</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-[30px]">
              <div className="w-full h-[10px] bg-white/10 rounded-[12px] overflow-hidden">
                <div
                  className="h-full bg-white rounded-[12px] transition-all duration-300 ease-out"
                  style={{ width: `${(progress / 4) * 100}%` }}
                />
              </div>
            </div>

            {currentSlide === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-[30px] min-h-[44px]">
                  <h2 className="text-[20px] leading-[24px] font-medium text-white">
                    What helps reinforce your confidence during a rough patch?
                  </h2>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  {[
                    "Pushing through without reflection",
                    "Trusting the work you've put in",
                    "Waiting to feel ready",
                  ].map((answer, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = correctAnswers[1] === index;
                    const isWrong = showResults && isSelected && !isCorrect;
                    const shouldHighlight =
                      showResults && isCorrect && selectedAnswer !== null;

                    let buttonClass =
                      "w-full flex items-center pl-5 h-[60px] bg-[#FFFFFF0A] border rounded-[30px] transition-all duration-300";

                    let textColor = "#FFFFFF"; 
                    let borderColor = "#FFFFFF33"; 

                    if (showResults) {
                      if (isCorrect) {
                        borderColor = "#B2FF8B";
                      } else if (isWrong) {
                        borderColor = "#F97066";
                        textColor = "#F97066";
                      } else {
                        borderColor = "#FFFFFF33";
                        textColor = "#FFFFFF";
                      }
                    } else {
                      buttonClass += " active:bg-[#FFFFFF26]";
                    }

                    return (
                      <motion.button
                        key={`${index}-${animationTrigger}`}
                        onClick={() => handleAnswerClick(index)}
                        className={buttonClass}
                        style={{
                          borderColor: borderColor,
                          color: textColor,
                        }}
                        animate={
                          isWrong && animationTrigger > 0
                            ? {
                                x: [0, -15, 15, -15, 15, -10, 10, 0],
                                transition: {
                                  duration: 0.5,
                                  times: [
                                    0, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 1,
                                  ],
                                  ease: "easeInOut",
                                },
                              }
                            : shouldHighlight && animationTrigger > 0
                            ? {
                                scale: [1, 1.15, 1.1, 1],
                                transition: {
                                  duration: 0.5,
                                  times: [0, 0.4, 0.8, 1],
                                  ease: "easeInOut",
                                },
                              }
                            : {}
                        }
                        disabled={showResults}
                      >
                        <span className="text-[16px]">{answer}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="flex-1 flex flex-col relative">
                <div className="mb-[30px] min-h-[44px]">
                  <h2 className="text-[20px] leading-[24px] font-medium text-white">
                    Why does the way you respond after setbacks reveal your
                    competitor identity?
                  </h2>
                </div>

                <div className="flex-1 flex flex-col">
                  <TextArea
                    value={textAnswer}
                    onChange={handleTextChange}
                    onFocus={handleTextFocus}
                    onBlur={handleTextBlur}
                    placeholder="Type your answer here..."
                    className="mb-4"
                  />
                </div>

                <Button
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim()}
                  className="absolute bottom-0 left-0 right-0 w-full"
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
