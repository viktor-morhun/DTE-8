"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, ChevronDown } from "lucide-react";
import * as React from "react";

type Props = {
    score: number;
    level: "Rookie" | string;
    streakDays: number;
    weekLabel?: string;
    plansDone?: number;
    plansTotal?: number;
    timeSpent?: string;
    onShowMore?: () => void;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export default function HiteSummaryCard({
    score,
    level,
    streakDays,
    weekLabel = "This week",
    plansDone = 2,
    plansTotal = 4,
    timeSpent = "1h 15m",
    onShowMore,
}: Props) {
    return (
        <motion.div
            className='relative w-full rounded-2xl overflow-hidden border border-white/10'
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            style={{
                background:
                    "linear-gradient(180deg, rgba(6,10,18,0.55), rgba(2,4,8,0.35))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
        >

            <div
                aria-hidden
                className='absolute inset-0 pointer-events-none'
                style={{
                    backgroundImage: "url('/hite-score-bg.png')",
                    backgroundSize: "290px 140px",
                    backgroundPosition: "right bottom",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.9,
                }}
            />

            <div className='relative z-10 p-3 text-white'>

                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center'>

                            <Image src='/eq.svg' alt='HITE' width={28} height={28} />
                        </div>

                        <div className='flex items-center gap-2'>
                            <span className='text-lg font-medium'>HITE Score</span>


                            <div className='inline-block text-[10px]'>
                                <AnimatePresence mode='wait' initial={false}>
                                    <motion.span
                                        key={level}
                                        initial={{ opacity: 0, y: 6, scale: 0.95, rotateX: -40 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.95, rotateX: 40 }}
                                        transition={{ duration: 0.35, ease: EASE }}
                                        className='inline-flex items-center gap-1 px-2 py-1 rounded-2xl'
                                        style={{
                                            backgroundColor: "#924AAB",
                                            color: "#FFFF00",
                                        }}
                                    >

                                        🐤 {level}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <motion.span
                        className='text-3xl font-bold tabular-nums'
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
                    >
                        {score}
                    </motion.span>
                </div>


                <div
                    className='my-2'
                    style={{
                        height: 1,
                        background:
                            "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                    }}
                />

                {/* === Active Streak === */}
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-8 h-8 rounded-full  flex items-center justify-center'>
                            <Image src='/fire.svg' alt='Streak' width={24} height={24} />
                        </div>
                        <span className='text-[15px]'>Active Streak</span>
                    </div>

                    <span className='text-[15px] font-semibold'>{streakDays} days</span>
                </div>

                <div
                    className=' rounded-xl py-2 px-3 flex items-center justify-between bg-[#00000033]'
                    
                >
                    <div className='flex w-full items-center justify-between text-sm'>
                        <div className='flex max-w-[92px] items-center gap-1.5'>
                            <div className='w-5 h-5 rounded-full flex items-center justify-center'>
                                <Image src='/calendar.svg' alt='Calendar' width={20} height={20} />
                            </div>
                            <span className='text-[#B59CFF]'>{weekLabel}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <div className='flex items-center gap-[1px] text-white/80'>

                                <Image src='/check2.svg' alt='Check' width={18} height={18} />
                                <span className='tabular-nums'>
                                    {plansDone}/{plansTotal} daily plans
                                </span>
                            </div>
                            <div className="w-[1px] h-4 bg-[#FFFFFF1A]"></div>

                            <div className='flex items-center gap-[1px] text-white/80'>
                                <Image src='/clock.svg' alt='Clock' width={18} height={18} />
                                <span className='tabular-nums'>{timeSpent}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    type='button'
                    onClick={onShowMore}
                    className='flex items-center gap-1 ml-auto text-white/80 hover:text-white transition text-sm'
                >
                    Show More
                    <ChevronDown size={12} />
                </button>
            </div>
        </motion.div>
    );
}