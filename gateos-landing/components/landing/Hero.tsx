"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-6 relative z-10"
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                        Zmień Portiernię w <span className="text-primary">Centrum Dowodzenia AI</span>.
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-neutral-400 max-w-lg"
                    >
                        Automatyzacja wag, kamer ANPR i dokumentów (OCR) w jednym systemie. Wdrożenie w 24h na Twoim sprzęcie.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-wrap items-center gap-4 pt-4"
                    >
                        <Button size="lg" className="bg-primary text-black font-semibold text-lg hover:bg-primary/90">
                            Zobacz Demo
                        </Button>
                        <p className="text-sm text-neutral-500">
                            ⚡ Zgodne z KSeF i RODO
                        </p>
                    </motion.div>
                </motion.div>

                {/* Right Column (Video Placeholder) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative aspect-video bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('/placeholder-grid.svg')] opacity-10"></div>
                        <div className="flex flex-col items-center gap-4 text-neutral-500 group-hover:text-primary transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-primary/10 group-hover:border-primary/50 transition-all">
                                <Play fill="currentColor" className="w-6 h-6 ml-1" />
                            </div>
                            <span className="text-sm font-mono tracking-widest uppercase">Live Feed z Wagi</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>
        </section>
    )
}
