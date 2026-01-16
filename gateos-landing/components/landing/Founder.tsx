import { ExternalLink } from "lucide-react"

export function Founder() {
    return (
        <section id="founder" className="py-24 border-t border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Image Placeholder */}
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-neutral-800 border-2 border-white/10 shrink-0 relative overflow-hidden">
                        {/* Creating a simplistic avatar placeholder if no image is available */}
                        <div className="absolute inset-0 flex items-center justify-center text-4xl text-neutral-600 font-bold bg-neutral-900">
                            KS
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-sm font-mono tracking-widest text-primary uppercase mb-2">Inżynierski Pragmatyzm</h2>
                        <h3 className="text-3xl font-bold text-white mb-6">Buduję infrastrukturę, która działa.</h3>
                        <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-8">
                            "Nazywam się Konrad Sędkowski. Buduję rozwiązania, które działają w brudzie, kurzu i hałasie, a nie tylko na slajdach.
                            GateOS powstał, bo widziałem ile czasu tracicie na przepisywanie kwitów."
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-6">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-primary transition-colors">
                                LinkedIn <ExternalLink size={16} className="ml-2" />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-primary transition-colors">
                                GitHub <ExternalLink size={16} className="ml-2" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
