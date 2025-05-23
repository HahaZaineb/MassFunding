"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowRight, Shield, Clock, Coins, HelpCircle, Rocket, Users, Zap } from "lucide-react"
import { useProjects } from "../context/project-context"
import { ProjectCard } from "./project-card"
import { useNavigate } from "../hooks/use-navigate"

export function LandingPage() {
  const { projects } = useProjects()
  const featuredProjects = projects.slice(0, 3)
  const { navigate } = useNavigate()

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
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Decentralized Crowdfunding on Massa
              </motion.h1>
              <motion.p 
                className="text-xl text-slate-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Fund innovative projects with transparent vesting schedules and receive NFTs as proof of contribution. Built on Massa's powerful blockchain technology.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold w-full sm:w-auto"
                  onClick={() => navigate("projects")}
                >
                  Explore Projects
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 w-full sm:w-auto"
                  onClick={() => navigate("request")}
                >
                  Request Funding
                </Button>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#00ff9d]/20 rounded-full blur-3xl"></div>
                <div className="relative bg-[#1a1a2e] p-8 rounded-2xl border border-[#00ff9d]/20">
                  <Rocket className="w-16 h-16 text-[#00ff9d] mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Powered by Massa</h3>
                  <p className="text-slate-300">Leveraging Massa's unique features for secure and efficient crowdfunding</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#16213e]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-[#1a1a2e] p-6 rounded-lg border border-[#00ff9d]/20"
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
              className="bg-[#1a1a2e] p-6 rounded-lg border border-[#00ff9d]/20"
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
              className="bg-[#1a1a2e] p-6 rounded-lg border border-[#00ff9d]/20"
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

      {/* FAQ Section */}
      <section className="py-16 bg-[#1a1a2e]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-[#16213e] p-6 rounded-lg border border-[#00ff9d]/20"
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
      <section className="py-16 bg-gradient-to-br from-[#16213e] to-[#1a1a2e]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Launch Your Project?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the growing community of innovators using MassFunding to bring their ideas to life on the Massa blockchain.
          </p>
          <Button 
            size="lg" 
            className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold"
            onClick={() => navigate("request")}
          >
            Request Funding Now
          </Button>
        </div>
      </section>
    </div>
  )
}
