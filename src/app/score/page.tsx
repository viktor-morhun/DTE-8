"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  motion,
  useMotionValue,
  animate,
  AnimatePresence,
  cubicBezier,
} from "framer-motion";
import { twMerge } from "tailwind-merge";
import Button from "@/components/ui/Button";
import PopperCrackerIcon from "@/components/icons/PopperCrackerIcon";
import FireIcon from "@/components/icons/FireIcon";
import ClockIcon from "@/components/icons/ClockIcon";
import HITEIcon from "@/components/icons/HITEIcon";

const EASE = cubicBezier(0.22, 1, 0.36, 1);

function ScoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get quiz results from URL params
  const firstAnswerResult = searchParams.get("firstAnswer"); // 'correct' or 'incorrect'
  const allCorrect = firstAnswerResult === "correct";

  // HITE SCORE
  const HITE_BASE = 915;

  // Calculate final target values immediately
  const targetValues = useMemo(() => {
    const completedDTE = 100;
    const streakMultiplier = 7;
    const correctBonus = allCorrect ? 15 : 0;
    const totalPoints = completedDTE + streakMultiplier + correctBonus;
    const finalHiteScore = HITE_BASE + totalPoints;

    return {
      completedDTE,
      streakMultiplier,
      correctBonus,
      totalPoints,
      finalHiteScore,
    };
  }, [allCorrect]);

  // Stats card (Active Streak)
  const daysMV = useMotionValue(0);
  const [daysVal, setDaysVal] = useState(0);

  const hiteMV = useMotionValue(0);
  const [hiteDeltaVal, setHiteDeltaVal] = useState(0);

  const completedMV = useMotionValue(0);
  const [completedVal, setCompletedVal] = useState(0);

  const streakMV = useMotionValue(0);
  const [streakVal, setStreakVal] = useState(0);

  const correctMV = useMotionValue(0);
  const [correctRowVal, setCorrectRowVal] = useState(0);

  const totalTarget = 100 + 7 + (allCorrect ? 15 : 0);
  const totalMV = useMotionValue(0);
  const [totalVal, setTotalVal] = useState(0);

  const [xpLevel, setXpLevel] = useState<"Rookie" | "Starter">("Rookie");

  // Motion value subscriptions
  useEffect(() => {
    const unsub1 = daysMV.on("change", (v) => setDaysVal(Math.round(v)));
    const unsub2 = hiteMV.on("change", (v) => setHiteDeltaVal(Math.round(v)));
    const unsub3 = completedMV.on("change", (v) =>
      setCompletedVal(Math.round(v))
    );
    const unsub4 = streakMV.on("change", (v) => setStreakVal(Math.round(v)));
    const unsub5 = correctMV.on("change", (v) =>
      setCorrectRowVal(Math.round(v))
    );
    const unsub6 = totalMV.on("change", (v) => setTotalVal(Math.round(v)));

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
    };
  }, [daysMV, hiteMV, completedMV, streakMV, correctMV, totalMV]);

  // Start animations
  useEffect(() => {
    // Play success sound
    const audio = new Audio("/success.mp3");
    audio.play().catch((error) => {
      console.log("Could not play audio:", error);
    });

    const baseDelay = 0.35;

    // Reset values
    daysMV.set(0);
    hiteMV.set(0);
    completedMV.set(0);
    streakMV.set(0);
    correctMV.set(0);
    totalMV.set(0);
    setXpLevel("Rookie");

    const ctrls: { stop: () => void }[] = [];

    // Active Streak animation
    ctrls.push(
      animate(daysMV, [0, 6], {
        duration: 1.4,
        ease: EASE,
        delay: 0.4,
      })
    );

    // Completed DTE: 0 -> 100
    ctrls.push(
      animate(completedMV, [0, 100], {
        duration: 1.0,
        ease: EASE,
        delay: baseDelay + 0.1,
      })
    );

    // DTE Streak Multiplier: 0 -> 7
    ctrls.push(
      animate(streakMV, [0, 7], {
        duration: 0.9,
        ease: EASE,
        delay: baseDelay + 0.8,
      })
    );

    // Correct Knowledge Check Answer: 0 -> 15 if all correct
    if (allCorrect) {
      ctrls.push(
        animate(correctMV, [0, 15], {
          duration: 0.8,
          ease: EASE,
          delay: baseDelay + 1.5,
        })
      );
    }

    // Total: 0 -> sum
    ctrls.push(
      animate(totalMV, [0, totalTarget], {
        duration: 1.0,
        ease: EASE,
        delay: baseDelay + (allCorrect ? 2.1 : 1.6),
      })
    );

    // HITE increment animation with badge change
    ctrls.push(
      animate(hiteMV, [0, totalTarget], {
        duration: 1.2,
        ease: EASE,
        delay: baseDelay + (allCorrect ? 2.5 : 2.0),
        onComplete: () => {
          setTimeout(() => setXpLevel("Starter"), 400);
        },
      })
    );

    return () => {
      ctrls.forEach((ctrl) => ctrl.stop());
    };
  }, [
    daysMV,
    hiteMV,
    completedMV,
    streakMV,
    correctMV,
    totalMV,
    allCorrect,
    totalTarget,
  ]);

  const handleNext = () => {
    // Use calculated target values
    const params = new URLSearchParams({
      hiteScore: targetValues.finalHiteScore.toString(),
      pointsEarned: targetValues.totalPoints.toString(),
      wasCorrect: allCorrect.toString(),
    });

    router.push(`/rating?${params.toString()}`);
  };

  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />

        <div className="relative z-10 min-h-dvh px-4 pt-[1rem] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col">
          <section className={twMerge("flex-1 flex flex-col mt-10")}>
            {/* Верхний поздравительный блок */}
            <motion.div
              className="text-center mb-[3.75rem]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <motion.div
                className="w-fit mx-auto"
                initial={{ scale: 0.9, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <PopperCrackerIcon />
              </motion.div>
              <motion.h1
                className="text-[32px] font-bold mb-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              >
                You Did It!
              </motion.h1>
              <motion.p
                className="text-white/80 "
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              >
                You&apos;ve completed today&apos;s DTE. Your <br /> metrics have
                now changed!
              </motion.p>
            </motion.div>

            {/* ===== STATS CARD ===== */}
            <motion.div
              className="w-full mb-[0.688rem] mt-15 flex flex-col p-3 bg-black/30 border border-white/20 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
            >
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.35 } },
                }}
                className="flex flex-col gap-2"
              >
                {/* Row 1 */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                  className="flex flex-row justify-between items-center"
                >
                  <span>Active Streak</span>
                  <div className="flex flex-row items-center gap-1.5">
                    <motion.span
                      aria-hidden
                      animate={{
                        rotate: [0, -6, 0, 6, 0],
                        scale: [1, 1.06, 1, 1.06, 1],
                      }}
                      transition={{
                        duration: 2.8,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    >
                      <FireIcon />
                    </motion.span>
                    <motion.span
                      className="text-[22px] font-medium tabular-nums"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                    >
                      {daysVal} days
                    </motion.span>
                  </div>
                </motion.div>

                {/* Row 2 */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                  className="flex flex-row justify-between text-sm text-white/80"
                >
                  <span>Time spent today:</span>
                  <div className="flex flex-row gap-1 items-center">
                    <motion.span
                      aria-hidden
                      animate={{ rotate: [0, -12, 0, 12, 0] }}
                      transition={{
                        duration: 3.0,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    >
                      <ClockIcon />
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      1 hour
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ===== HITE SCORE CARD ===== */}
            <motion.div
              className="w-full flex flex-col py-4 px-3 border border-violet rounded-2xl relative overflow-hidden"
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url('/hite-score-bg.png')`,
                  backgroundSize: "290px 140px",
                  backgroundPosition: "right bottom",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.9,
                }}
              />

              <div className="relative z-10">
                <div className="flex flex-row justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <HITEIcon />
                    <span className="font-medium text-lg">HITE Score</span>

                    {/* === XP BADGE with animated switch === */}
                    <div className="font-medium text-[10px] rounded-4xl">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={xpLevel}
                          initial={{
                            opacity: 0,
                            y: 6,
                            scale: 0.95,
                            rotateX: -40,
                          }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95, rotateX: 40 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-4xl"
                          style={{
                            backgroundColor:
                              xpLevel === "Rookie" ? "#363391" : "#924AAB",
                            color: xpLevel === "Rookie" ? "#B2FF8B" : "#FFFF00",
                          }}
                        >
                          {xpLevel === "Rookie" ? "🌱 Rookie" : "🐤 Starter"}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  <motion.span
                    className="font-medium text-2xl tabular-nums"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
                  >
                    {(HITE_BASE + hiteDeltaVal).toLocaleString()}
                  </motion.span>
                </div>

                <motion.div
                  className="w-full flex flex-col space-y-1.5 font-medium text-sm border-b pb-1 mb-1.5 border-b-white/20"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.35 } },
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, ease: EASE },
                      },
                    }}
                    className="flex flex-row justify-between"
                  >
                    <span className="text-white/80">Completed DTE</span>
                    <span className="tabular-nums">+{completedVal}</span>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, ease: EASE },
                      },
                    }}
                    className="flex flex-row justify-between"
                  >
                    <span className="text-white/80">DTE Streak Multiplier</span>
                    <span className="tabular-nums">+{streakVal}</span>
                  </motion.div>

                  {allCorrect ? (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: EASE },
                        },
                      }}
                      className="flex flex-row justify-between"
                    >
                      <span className="text-white/80">Correct Knowledge</span>
                      <span className="tabular-nums">+{correctRowVal}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: EASE },
                        },
                      }}
                      className="flex flex-row justify-between"
                    >
                      <span className="text-white/80">
                        Incorrect Knowledge Check Answer
                      </span>
                      <span className="tabular-nums">+0</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  className="flex flex-row justify-between"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: allCorrect ? 1.9 : 1.4,
                  }}
                >
                  <span>Total</span>
                  <span className="font-medium text-sm text-green tabular-nums">
                    +{totalVal} points
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Кнопка внизу */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            className="mt-auto pt-8"
          >
            <Button
              onClick={handleNext}
              className="h-10 w-full"
              variant="text"
            >
              Next
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoadingScore() {
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

export default function ScorePage() {
  return (
    <Suspense fallback={<LoadingScore />}>
      <ScoreContent />
    </Suspense>
  );
}
