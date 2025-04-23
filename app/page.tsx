import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RequestFunding from "../components/request-funding"
import Fund from "../components/fund"
import { Button } from "../components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function Home() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showFundForm, setShowFundForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-center">MassFunding</h1>
        <p className="text-center text-slate-300 mt-2">Crowdfunding on Massa with deferred calls and vesting</p>
      </header>

      <main className="container mx-auto mt-8 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[70vh]">
          {/* Request Funding Section */}
          <AnimatePresence>
            {!showFundForm && (
              <motion.div
                className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 relative overflow-hidden"
                initial={{ x: showRequestForm ? 400 : 0 }}
                animate={{ x: showRequestForm ? 400 : 0 }}
                exit={{ x: -400 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {!showRequestForm ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                      <ArrowRight size={40} />
                    </div>
                    <h2 className="text-2xl font-bold">Request Funding</h2>
                    <p className="text-center text-slate-300 max-w-md">
                      Are you an enterprise or association looking for funding? Request funds and specify your vesting
                      schedule.
                    </p>
                    <Button
                      size="lg"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Request Funding
                    </Button>
                  </div>
                ) : (
                  <RequestFunding onBack={() => setShowRequestForm(false)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fund Section */}
          <AnimatePresence>
            {!showRequestForm && (
              <motion.div
                className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 relative overflow-hidden"
                initial={{ x: showFundForm ? 400 : 0 }}
                animate={{ x: showFundForm ? 400 : 0 }}
                exit={{ x: 400 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {!showFundForm ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                      <ArrowLeft size={40} />
                    </div>
                    <h2 className="text-2xl font-bold">Fund Projects</h2>
                    <p className="text-center text-slate-300 max-w-md">
                      Browse projects and donate MAS tokens. Receive an NFT as proof of your contribution.
                    </p>
                    <Button
                      size="lg"
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowFundForm(true)}
                    >
                      Fund Projects
                    </Button>
                  </div>
                ) : (
                  <Fund onBack={() => setShowFundForm(false)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="container mx-auto py-6 mt-12 text-center text-slate-400 text-sm">
        <p>MassFunding - Powered by Massa Blockchain</p>
      </footer>
    </div>
  )
}
