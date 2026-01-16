"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, CheckCircle2 } from "lucide-react"

export function ChatSimulation() {
    const [messages, setMessages] = useState<Array<{ id: number; role: "user" | "bot"; text: string }>>([])
    const [isTyping, setIsTyping] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)

    const startDemo = async () => {
        if (hasStarted) return
        setHasStarted(true)

        // User Message
        const userMsg = { id: 1, role: "user" as const, text: "Status pojazdu WZ 12345?" }
        setMessages([userMsg])

        // Simulate thinking
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Bot Response
        const botMsg = {
            id: 2,
            role: "bot" as const,
            text: "Pojazd WZ 12345 (Cementownia Odra) wjechał o 8:15. Waga netto: 24,500 kg. Dokumenty WZ zarchiwizowane."
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
    }

    return (
        <section className="py-24 bg-neutral-900/50 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Twój asystent logistyczny 24/7</h2>
                    <p className="text-neutral-400">Zapytaj o cokolwiek. GateOS analizuje dane w czasie rzeczywistym.</p>
                </div>

                <div className="max-w-2xl mx-auto rounded-xl border border-white/10 bg-black shadow-2xl overflow-hidden">
                    {/* Mock Window Header */}
                    <div className="h-10 bg-neutral-900 flex items-center px-4 gap-2 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>
                        <div className="ml-4 text-xs text-neutral-500 font-mono">gateos-slack-bot — private</div>
                    </div>

                    {/* Chat Area */}
                    <div className="h-[400px] flex flex-col p-6 overflow-y-auto relative">
                        {!hasStarted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Button onClick={startDemo} size="lg" className="bg-primary text-black hover:bg-primary/90 text-md font-bold px-8 py-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                        <Send className="w-5 h-5 mr-3" /> Uruchom Demo
                                    </Button>
                                </motion.div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col gap-4">
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-primary/20 text-primary' : 'bg-neutral-800 text-neutral-400'}`}>
                                            {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={`p-3 rounded-lg max-w-[80%] text-sm leading-relaxed ${msg.role === 'bot' ? 'bg-neutral-800 text-white' : 'bg-primary text-black font-medium'}`}>
                                            {msg.text}
                                            {msg.role === 'bot' && (
                                                <div className="mt-2 flex items-center gap-1.5">
                                                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] py-0 h-5">
                                                        <CheckCircle2 size={10} className="mr-1" /> Verified by GateOS
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-neutral-800 p-3 rounded-lg flex gap-1 items-center">
                                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
