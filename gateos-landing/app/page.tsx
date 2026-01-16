import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { ChatSimulation } from "@/components/landing/ChatSimulation"
import { BentoGrid } from "@/components/landing/BentoGrid"
import { Founder } from "@/components/landing/Founder"
import { Footer } from "@/components/landing/Footer"
import { RealChat } from "@/components/landing/RealChat"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-text selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <ChatSimulation />
      <BentoGrid />
      <Founder />
      <Footer />
      <RealChat />
    </main>
  )
}
