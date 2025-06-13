'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      question: 'What is MassFunding?',
      answer:
        'MassFunding is a decentralized crowdfunding platform built on the Massa blockchain. It enables project creators to raise funds with transparent vesting schedules.',
    },
    {
      question: 'How does the vesting schedule work?',
      answer:
        "Funds are released according to a predefined vesting schedules. This ensures that project creators remain accountable and deliver on their promises while protecting contributors' investments.",
    },
    {
      question: 'How do I start a project?',
      answer:
        "Simply click on 'Request Funding' and fill out the project details, including your funding goal and vesting schedule. Once approved, your project will be listed on the platform.",
    },
    {
      question: 'How does crowdfunding work on Massa?',
      answer:
        "Creators launch campaigns by deploying smart contracts on Massa. Backers contribute MAS tokens to fund the campaign. If funds are raised before lock lock period, the creator receives the funds incrementally according to the release interval and percentage..",
    },
  ];

  return (
    <section className="py-16 bg-[#0f1629]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
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
                  <h3 className="text-lg font-bold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
