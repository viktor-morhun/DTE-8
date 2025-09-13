"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function QuestionsPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex justify-center">
      <div className="min-h-screen max-w-md w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/quiz-bg.png')` }}
        />

        <div className="relative z-10 h-dvh px-4 pt-[56px] pb-[3.125rem]">
          <div
            className="h-full w-full p-3 flex flex-col backdrop-blur-[20px] border border-[#FFFFFF33] rounded-3xl"
            style={{
              background:
                "radial-gradient(60.56% 60.56% at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 100%)",
            }}
          >
            <div className="w-full relative max-h-[305px] h-full rounded-2xl border border-[#FFFFFF33]">
              <Image
                src="/intro-shot.jpg"
                alt="Unlock Icon"
                fill
                style={{ objectFit: "cover" }}
                className="object-cover rounded-2xl"
              />
            </div>
            <h1 className="text-[24px] font-medium mt-[28px]">Lorem ipsum</h1>
            <p className="text-[14px] text-[#B5B5B5] mt-4">
              As routines shift, your attention can start scanning in too many
              directions. When you’re adding new elements—more reps, different
              feedback, higher expectations—it’s easy for your focus to feel
              stretched. Athletes who stay grounded during growth phases usually
              return to one constant. They build around a steady focal point
              instead of chasing everything at once. This is what keeps your
              attention useful, even in the middle of change.
            </p>
            <div className="mt-4 flex items-center px-1.5 gap-4">
              <Image
                src="/flash.png"
                alt="flash"
                width={19}
                height={24}
                className="opacity-90"
              />
              <span className="text-[14px] font-medium">3 Flashcards</span>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => router.push("/flashcard")}
                className="w-full h-[60px] rounded-[30px]"
              >
                Start
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
