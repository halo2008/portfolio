"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Scale, Smartphone, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

export function BentoGrid() {
    return (
        <section id="features" className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Infrastruktura krytyczna wymaga solidności</h2>
                    <p className="text-neutral-400 max-w-2xl">Nie polegamy na chmurze tam, gdzie liczy się każda sekunda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                    {/* Large Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="md:col-span-2 md:row-span-2"
                    >
                        <Card className="h-full bg-surface/50 border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                    <Scale size={24} />
                                </div>
                                <CardTitle>IoT Integration</CardTitle>
                                <CardDescription className="text-base pt-2">
                                    Natywna obsługa wag samochodowych (Radwag, Precia Molen) przez RS232/Ethernet.
                                    Integracja z kamerami Hikvision/Dahua dla automatycznego odczytu tablic (ANPR).
                                    Wszystko działa lokalnie na Twoim serwerze.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-40 bg-[url('/grid.svg')] opacity-20 mt-4"></CardContent>
                        </Card>
                    </motion.div>

                    {/* Small Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="h-full bg-surface/50 border-white/5 hover:border-primary/50 transition-all group">
                            <CardHeader>
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-500 group-hover:text-blue-400 transition-colors">
                                    <Smartphone size={20} />
                                </div>
                                <CardTitle className="text-lg">Mobile Driver App</CardTitle>
                                <CardDescription>
                                    Kierowca nie musi wysiadać z kabiny. Awizacja i kwit wagowy prosto na smartfonie.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Small Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="h-full bg-surface/50 border-white/5 hover:border-primary/50 transition-all group">
                            <CardHeader>
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 text-green-500 group-hover:text-green-400 transition-colors">
                                    <ShieldCheck size={20} />
                                </div>
                                <CardTitle className="text-lg">Local AI & Privacy</CardTitle>
                                <CardDescription>
                                    Twoje dane nie trenują modeli publicznych. Lokalny RAG zapewnia pełną prywatność dokumentów WZ.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
