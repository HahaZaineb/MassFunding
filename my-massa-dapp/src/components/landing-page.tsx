"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowRight, Shield, Clock, Coins, HelpCircle, Rocket, Users, Zap } from "lucide-react"
import { useProjects } from "../context/project-context"
import { useNavigate } from "../hooks/use-navigate"

export function LandingPage() {
  const { projects } = useProjects()
  const featuredProjects = projects.slice(0, 3)
  const { navigate } = useNavigate()

  // Define category images
  const categoryImages = {
    Environment: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    Education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1722&q=80",
    Healthcare: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
  };

  const faqs = [
    {
      question: "What is MassFunding?",
      answer: "MassFunding is a decentralized crowdfunding platform built on the Massa blockchain. It enables project creators to raise funds with transparent vesting schedules and provides contributors with NFT receipts for their support."
    },
    {
      question: "How does the vesting schedule work?",
      answer: "Funds are released according to predefined milestones and vesting schedules. This ensures that project creators remain accountable and deliver on their promises while protecting contributors' investments."
    },
    {
      question: "What are NFT receipts?",
      answer: "When you contribute to a project, you receive a unique NFT that serves as proof of your contribution. These NFTs can be used for governance voting and may provide additional benefits depending on the project."
    },
    {
      question: "How do I start a project?",
      answer: "Simply click on 'Request Funding' and fill out the project details, including your funding goal, vesting schedule, and project milestones. Once approved, your project will be listed on the platform."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00ff9d] to-[#00ff9d] bg-clip-text text-transparent">
              Fund the Future of Massa
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Support innovative projects building on the Massa blockchain and help shape the future of decentralized applications.
            </p>
            <Button 
              onClick={() => navigate('fund')} 
              className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium px-8 py-6 text-lg"
            >
              Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Vesting</h3>
              <p className="text-slate-300">
                Funds are released according to predefined vesting schedules, ensuring project accountability.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Coins className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">NFT Receipts</h3>
              <p className="text-slate-300">
                Receive unique NFTs as proof of contribution that can be used for governance voting.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#00ff9d] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Milestone Tracking</h3>
              <p className="text-slate-300">
                Track project progress through transparent milestones and regular updates from project creators.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 bg-[#0f1629]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Featured Projects</h2>
          <p className="text-slate-300 text-center max-w-2xl mx-auto mb-12">
            Discover innovative projects building on the Massa blockchain and help bring them to life.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-lg border border-[#00ff9d]/20 bg-[#1a1a2e] shadow-lg hover:shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all duration-300"
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={categoryImages[project.category] || "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-70"></div>
                  <div className="absolute top-3 right-3 bg-[#00ff9d] text-[#0f1629] font-semibold text-xs px-2 py-1 rounded">
                    {project.category}
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#00ff9d] mb-2">{project.name}</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    {project.description.substring(0, 100)}...
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{project.amountRaised} / {project.amountNeeded} MAS</span>
                      <span className="text-[#00ff9d]">{((project.amountRaised / project.amountNeeded) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#0f1629] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00ff9d]" 
                        style={{ width: `${Math.min((project.amountRaised / project.amountNeeded) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('fund')} 
                    className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-[#0f1629] font-medium"
                  >
                    Fund This Project
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('fund')} 
              variant="outline" 
              className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              View All Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-[#0f1629] p-6 rounded-lg border border-[#00ff9d]/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-[#00ff9d] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="text-black w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                    <p className="text-slate-300">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0f1629] to-[#1a1a2e]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Launch Your Project?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the growing community of innovators using MassFunding to bring their ideas to life on the Massa blockchain.
          </p>
          <Button 
            size="lg" 
            className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black font-bold"
            onClick={() => navigate("request")}
          >
            Request Funding Now
          </Button>
        </div>
      </section>
    </div>
  )
}
