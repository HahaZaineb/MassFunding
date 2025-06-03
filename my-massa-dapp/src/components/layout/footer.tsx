export function Footer() {
  return (
    <footer className="bg-[#1a1a2e] border-t border-[#00ff9d]/20 py-8 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-[#00ff9d] font-bold text-lg mb-4">MassFunding</h3>
            <p className="text-slate-300 text-sm">
              A decentralized crowdfunding platform built on Massa blockchain with vesting schedules and deferred calls.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/projects" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Explore Projects
                </a>
              </li>
              <li>
                <a href="/request" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Request Funding
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-slate-300 hover:text-[#00ff9d] transition">
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://docs.massa.net/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Massa Docs
                </a>
              </li>
              <li>
                <a href="https://github.com/massalabs" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#00ff9d] transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://discord.gg/massa" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Discord
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-slate-300 hover:text-[#00ff9d] transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#00ff9d]/20 mt-8 pt-6 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} MassFunding. Built on Massa blockchain.</p>
        </div>
      </div>
    </footer>
  )
}
