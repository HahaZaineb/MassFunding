import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Fund from "@/components/fund"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { LandingPage } from "@/components/landing-page"
import { RequestFunding } from "@/components/request-funding"
import { ProjectProvider } from "@/context/project-context"
import { NavigationProvider } from "@/hooks/use-navigate"


function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "request" | "fund" | "about" | "projects">("home")
  const [isLoading, setIsLoading] = useState(true)
  const [hoverLeft, setHoverLeft] = useState(false)
  const [hoverRight, setHoverRight] = useState(false)

  // Add dark mode class to document
  useEffect(() => {
    document.documentElement.classList.add("dark")

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      document.documentElement.classList.remove("dark")
      clearTimeout(timer)
    }
  }, [])

  const handleNavigate = (page: "home" | "request" | "fund" | "about" | "projects") => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181f36] text-white">
        <div className="text-center">
          <h2 className="mt-4 text-2xl font-bold text-[#00ff9d]">Loading Application</h2>
          <p className="text-slate-300 mt-2">Initializing...</p>
        </div>
      </div>
    )
  }

  // Split-screen homepage
  if (currentPage === "home") {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Request Funding Section */}
        <div
          className={`relative split-section ${'w-full md:w-1/2 h-1/2 md:h-screen'} bg-[#181f36] transition-all duration-500 cursor-pointer flex items-center justify-center`}
          onMouseEnter={() => setHoverLeft(true)}
          onMouseLeave={() => setHoverLeft(false)}
          onClick={() => setCurrentPage("request")}
          style={{
            flex: hoverLeft && !hoverRight ? '0 0 55%' : hoverRight && !hoverLeft ? '0 0 45%' : '1',
          }}
        >
          <div className={`split-text text-center text-5xl md:text-6xl font-extrabold transition-colors duration-300 ${hoverLeft ? 'text-[#00ff9d]' : 'text-white'}`}>
            Request<br />Funding
          </div>
          <div className={`absolute bottom-10 text-center w-full transition-opacity duration-500 ${hoverLeft ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[#00ff9d] text-lg mb-4">Start your project journey here</p>
            <div className="border-b border-[#00ff9d]/30 w-24 mx-auto"></div>
          </div>
        </div>
        {/* Fund Project Section */}
        <div
          className={`relative split-section ${'w-full md:w-1/2 h-1/2 md:h-screen'} bg-[#1a2340] transition-all duration-500 cursor-pointer flex items-center justify-center`}
          onMouseEnter={() => setHoverRight(true)}
          onMouseLeave={() => setHoverRight(false)}
          onClick={() => setCurrentPage("fund")}
          style={{
            flex: hoverRight && !hoverLeft ? '0 0 55%' : hoverLeft && !hoverRight ? '0 0 45%' : '1',
          }}
        >
          <div className={`split-text text-center text-5xl md:text-6xl font-extrabold transition-colors duration-300 ${hoverRight ? 'text-[#00ff9d]' : 'text-white'}`}>
            Fund<br />Project
          </div>
          <div className={`absolute bottom-10 text-center w-full transition-opacity duration-500 ${hoverRight ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[#00ff9d] text-lg mb-4">Support innovative projects</p>
            <div className="border-b border-[#00ff9d]/30 w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "request":
        return <RequestFunding onBack={() => setCurrentPage("home")} />
      case "fund":
        return <Fund onBack={() => setCurrentPage("home")} />
      case "projects":
        return <Fund onBack={() => setCurrentPage("home")} />
      case "about":
        return (
          <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6 text-[#00ff9d]">About MassFunding</h1>
            <div className="bg-[#1a1a2e] p-8 rounded-lg border border-[#00ff9d]/20">
              <p className="text-lg text-slate-300 mb-6">
                MassFunding is a decentralized crowdfunding platform built on the Massa blockchain.
                It leverages Massa's unique features like deferred calls and vesting schedules to create
                a transparent and accountable funding ecosystem.
              </p>
              <h2 className="text-2xl font-bold mb-4 text-white">Key Features</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Transparent vesting schedules for project funding</li>
                <li>NFT-based contribution receipts</li>
                <li>Milestone-based fund release</li>
                <li>Built on Massa's secure and efficient blockchain</li>
                <li>Community governance through NFT voting</li>
              </ul>
            </div>
          </div>
        )
      default:
        return <LandingPage />
    }
  }

  return (
    <ThemeProvider>
      <ProjectProvider>
        <NavigationProvider onNavigate={handleNavigate}>
          <div className="min-h-screen bg-gradient-to-br from-massa-darker to-massa-dark text-white flex flex-col">
            <Navbar 
              onNavigate={handleNavigate} 
              currentPage={currentPage}
            />
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {renderPage()}
            </main>

            <Footer />
          </div>
        </NavigationProvider>
      </ProjectProvider>
    </ThemeProvider>
  )
}

export default App
