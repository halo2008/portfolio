export function Footer() {
    return (
        <footer className="py-8 border-t border-white/5 bg-black">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-600">
                <p>&copy; {new Date().getFullYear()} GateOS. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    )
}
