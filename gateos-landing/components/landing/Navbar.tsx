import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Navbar() {
    return (
        <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <a href="#" className="text-xl font-mono font-bold tracking-tighter text-white">
                        GateOS
                    </a>
                    <div className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
                        <a href="#features" className="hover:text-primary transition-colors">
                            Funkcje
                        </a>
                        <a href="#security" className="hover:text-primary transition-colors">
                            Bezpieczeństwo
                        </a>
                        <a href="#founder" className="hover:text-primary transition-colors">
                            O Mnie
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="default" className="bg-primary text-black font-semibold hover:bg-primary/90">
                        Umów Demo
                    </Button>
                    <button className="md:hidden text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    )
}
