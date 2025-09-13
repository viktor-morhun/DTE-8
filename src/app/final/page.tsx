// app/dashboard/page.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import HiteSummaryCard from "@/components/dashboard/HiteSummaryCard";
import PlanStep from "@/components/dashboard/PlanStep";
import {
  PlanProgress,
  StepState,
  readPlanProgress,
  resetAllProgress,
  consumeJustFinishedFlag,
} from "@/lib/planProgress";

type StepAvail = Exclude<StepState, "locked">;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDiscoverOnly = searchParams?.get("view") === "discover";

  // Get score data from URL params or use defaults
  const hiteScore = parseInt(searchParams?.get("hiteScore") || "1074");
  const pointsEarned = parseInt(searchParams?.get("pointsEarned") || "0");
  const wasCorrect = searchParams?.get("wasCorrect") === "true";
  const [level] = useState<"Starter">("Starter");
  const [activeStreak] = useState(6);

  const [discoverState, setDiscoverState] = useState<StepAvail>("available");
  const [trainState, setTrainState] = useState<StepState>("locked");
  const [executeState, setExecuteState] = useState<StepState>("locked");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalFor, setModalFor] = useState<"train" | "execute" | null>(null);

  // 👇 Покажем «All Done» один раз после завершения Execute
  const [showAllDoneOnce, setShowAllDoneOnce] = useState(false);

  const prevDiscoverRef = useRef<string | null>(null);
  const prevTrainRef = useRef<string | null>(null);

  // Если только что закончили весь DTE, отобразим «All Done» и тихо сбросим прогресс.
  useEffect(() => {
    if (consumeJustFinishedFlag()) {
      setShowAllDoneOnce(true);
      // даём UI отрендерить «All Done», затем сбросим прогресс,
      // но «All Done» останется видимым в этот заход (управляется локальным стейтом).
      setTimeout(() => {
        resetAllProgress();
      }, 120);
    }
  }, []);

  const syncFromStorage = useCallback(() => {
    if (showDiscoverOnly) {
      setDiscoverState("available");
      setTrainState("locked");
      setExecuteState("locked");
      return;
    }

    const p: PlanProgress = readPlanProgress();

    const d: StepAvail = p.discover === "completed" ? "completed" : "available";
    const t: StepState =
      p.discover === "completed"
        ? p.train === "completed"
          ? "completed"
          : "available"
        : "locked";
    const e: StepState =
      p.execute === "completed"
        ? "completed"
        : p.execute === "available"
        ? "available"
        : "locked";

    setDiscoverState(d);
    setTrainState(t);
    setExecuteState(e);

    // попапы разблокировки: не показываем, если сейчас выводим All Done
    const prevD = prevDiscoverRef.current;
    const prevT = prevTrainRef.current;

    if (
      !showAllDoneOnce &&
      !showDiscoverOnly &&
      prevD !== "completed" &&
      d === "completed"
    ) {
      setModalFor("train");
      setModalVisible(true);
    }
    if (
      !showAllDoneOnce &&
      !showDiscoverOnly &&
      prevT !== "completed" &&
      t === "completed"
    ) {
      setModalFor("execute");
      setModalVisible(true);
    }

    prevDiscoverRef.current = d;
    prevTrainRef.current = t;
  }, [showDiscoverOnly, showAllDoneOnce]);

  // модалка «Go to Train» один раз при заходе с Discover (?view=discover)
  useEffect(() => {
    if (!showDiscoverOnly || showAllDoneOnce) return;
    const p = readPlanProgress();
    const shouldShow = p.discover === "completed" && p.train === "available";
    const SEEN_KEY = "__train_popup_once";
    if (shouldShow && sessionStorage.getItem(SEEN_KEY) !== "1") {
      setTimeout(() => {
        setModalFor("train");
        setModalVisible(true);
        sessionStorage.setItem(SEEN_KEY, "1");
      }, 60);
    }
  }, [showDiscoverOnly, showAllDoneOnce]);

  useEffect(() => {
    syncFromStorage();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "planProgress") syncFromStorage();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };
    const onCustom = () => syncFromStorage();

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("planprogress:updated", onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(
        "planprogress:updated",
        onCustom as EventListener
      );
    };
  }, [syncFromStorage]);

  const onStartDiscover = () => router.push("/discover");
  const onStartTrain = () =>
    trainState === "available" && router.push("/train");
  const onStartExecute = () =>
    executeState === "available" && router.push("/execute");

  const shouldShowAllDoneCard = true;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/quiz-bg.png')` }}
      />
      <div
        className="relative z-10 w-full max-w-[560px] h-full overflow-hidden flex flex-col py-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,17,37,0.75), rgba(0,0,0,0.65))",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.75)",
        }}
      >
        <div className="flex-1 overflow-auto">
          <div className="px-4 text-white">
            <header className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-extrabold">Hi there!</h1>
              <div className="flex items-center gap-3">
                <button
                  aria-label="notifications"
                  className="w-12 h-12 rounded-full bg-transparent grid place-items-center"
                >
                  <Image
                    src="/notification.svg"
                    alt="Avatar"
                    width={27}
                    height={27}
                  />
                </button>
                <button
                  aria-label="profile"
                  className="w-12 h-12 rounded-full grid place-items-center border-[1.2px] border-[#FFFFFF33] bg-[#00000066]"
                >
                  <Image
                    src="/profile.svg"
                    alt="Avatar"
                    width={27}
                    height={27}
                  />
                </button>
              </div>
            </header>

            {/* Summary */}
            <section className="relative mb-8">
              <HiteSummaryCard
                score={hiteScore}
                level={level}
                streakDays={activeStreak}
                weekLabel="This week"
                plansDone={2}
                plansTotal={4}
                timeSpent="1h 15m"
                onShowMore={() => {}}
              />
            </section>

            {/* Today's Plan */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Today&apos;s Plan</h3>

              {shouldShowAllDoneCard ? (
                <div
                  className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-white/80 mb-4">
                    You&apos;re All Done For Today
                  </p>
                  <div className="w-20 h-20 grid place-items-center">
                    <Image src="/check.png" alt="Done" width={60} height={60} />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="absolute left-1 top-0 bottom-0 w-1 rounded-full bg-white/10"
                    style={{ transform: "translateX(-50%)" }}
                  />
                  <div className="space-y-4 pl-3">
                    <PlanStep
                      title="Discover"
                      iconSrc="/Discover.png"
                      state={discoverState}
                      accent
                      onStart={onStartDiscover}
                    />
                    <PlanStep
                      title="Train"
                      iconSrc="/Train.png"
                      state={trainState}
                      onStart={onStartTrain}
                    />
                    <PlanStep
                      title="Execute"
                      iconSrc="/Execute.png"
                      state={executeState}
                      onStart={onStartExecute}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Coach's Corner */}
            <section style={{ marginBottom: 32 }}>
              <div className="flex items-center w-full mb-4 gap-1.5">
                {" "}
                <h3 className="text-2xl font-bold">Coach&apos;s Corner</h3>
                <Image
                  src={"/checkbox.svg"}
                  alt="Checkbox"
                  width={30}
                  height={30}
                />
              </div>{" "}
              <div
                className="rounded-2xl p-6 bg-gradient-to-br from-[#151029] to-[#2a1630] border border-white/10 shadow-lg"
                style={{ minHeight: 160 }}
              >
                <h4 className="text-lg font-semibold mb-2">
                  Composure Under Pressure
                </h4>
                <p className="text-white/70 leading-relaxed mb-4">
                  Staying calm in tough moments helps you think clearly, make
                  smart decisions, and avoid mistakes. When you&apos;re
                  composed, pressure doesn&apos;t shake you — it sharpens you.
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-full bg-white text-black">
                    Coach Check-ins
                  </button>
                  <button className="px-4 py-2 rounded-full bg-transparent border border-white/10 text-white/80">
                    Show more
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/quiz-bg.png')` }}
      />
      <div className="relative z-10 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <DashboardContent />
    </Suspense>
  );
}
