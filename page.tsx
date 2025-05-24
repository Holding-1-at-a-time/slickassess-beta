"use client"

import { useRef, useEffect, useState } from "react"
import { CheckCircle, ChevronDown, Menu, X } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const pricingRef = useRef(null)
  const ctaRef = useRef(null)

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  useEffect(() => {
    // Initialize animations
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in")
        }
      })
    }, observerOptions)

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Meta tags for SEO */}
      <head>
        <title>SlickAssess - Vehicle Assessment Platform</title>
        <meta
          name="description"
          content="Streamline your vehicle assessments with our all-in-one platform. Manage your fleet, schedule assessments, and optimize pricing."
        />
        <meta name="keywords" content="vehicle assessment, fleet management, automotive, booking system" />
        <meta property="og:title" content="SlickAssess - Vehicle Assessment Platform" />
        <meta property="og:description" content="Streamline your vehicle assessments with our all-in-one platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#121212]/90 border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <span className="text-[#00ae98] mr-1">Slick</span>Assess
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-[#00ae98] transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[#00ae98] transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-[#00ae98] transition-colors">
              About
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-md border border-[#00ae98] text-[#00ae98] hover:bg-[#00ae98]/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-md bg-[#00ae98] text-white hover:bg-[#00ae98]/80 transition-colors shadow-[0_0_15px_rgba(0,174,152,0.5)]"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-[#121212] z-40 pt-20 px-6">
            <div className="flex flex-col space-y-6">
              <Link
                href="#features"
                className="text-xl text-gray-300 hover:text-[#00ae98] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-xl text-gray-300 hover:text-[#00ae98] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="text-xl text-gray-300 hover:text-[#00ae98] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-6 flex flex-col space-y-4">
                <Link
                  href="/sign-in"
                  className="w-full px-4 py-3 text-center rounded-md border border-[#00ae98] text-[#00ae98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full px-4 py-3 text-center rounded-md bg-[#00ae98] text-white shadow-[0_0_15px_rgba(0,174,152,0.5)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-[#121212] to-[#121212]/90"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/placeholder.svg?height=1080&width=1920&query=abstract%20digital%20technology%20grid%20pattern%20dark%20teal')] bg-cover bg-center opacity-20"></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-[#00ae98]/20 blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-[#00ae98]/20 blur-[100px]"></div>
        </div>

        <motion.div style={{ opacity, scale }} className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight"
            >
              Streamline Your{" "}
              <span className="text-[#00ae98] relative">
                Vehicle Assessments
                <span className="absolute -inset-1 blur-md bg-[#00ae98]/30 -z-10 rounded-lg"></span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Manage your fleet, schedule assessments, and optimize pricing all in one place with our AI-powered
              platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                href="/sign-up"
                className="px-8 py-4 rounded-lg bg-[#00ae98] text-white font-bold hover:bg-[#00ae98]/80 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,174,152,0.5)]"
              >
                Get Started
              </Link>
              <Link
                href="/demo-tenant/dashboard"
                className="px-8 py-4 rounded-lg border border-[#707070] text-white font-bold hover:border-[#00ae98] hover:text-[#00ae98] transition-all transform hover:scale-105"
              >
                View Demo
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 md:mt-24 max-w-5xl mx-auto relative"
          >
            <div className="relative z-10 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,174,152,0.3)] border border-[#2a2a2a] transform transition-transform hover:scale-[1.01]">
              <Image
                src="/placeholder.svg?height=720&width=1280&query=dark%20modern%20dashboard%20UI%20with%20teal%20accents%20vehicle%20management"
                width={1280}
                height={720}
                alt="SlickAssess Dashboard Preview"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ae98]/0 via-[#00ae98]/20 to-[#00ae98]/0 rounded-xl blur-xl -z-10 opacity-60"></div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#121212] to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#121212] to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#121212] to-transparent"></div>
          <div className="absolute inset-0 bg-[#121212]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="relative inline-block">
                Powerful Features
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#00ae98]/0 via-[#00ae98] to-[#00ae98]/0"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage your vehicle assessments efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Vehicle Management",
                description: "Track and manage your entire fleet in one place.",
                icon: "/placeholder.svg?height=80&width=80&query=car%20icon%20teal",
                delay: 0,
              },
              {
                title: "Assessment Tools",
                description: "Comprehensive tools for vehicle assessments and inspections.",
                icon: "/placeholder.svg?height=80&width=80&query=checklist%20icon%20teal",
                delay: 0.1,
              },
              {
                title: "AI-Powered Booking",
                description: "Smart booking system with AI assistant and calendar integration.",
                icon: "/placeholder.svg?height=80&width=80&query=robot%20assistant%20icon%20teal",
                delay: 0.2,
              },
              {
                title: "Dynamic Pricing",
                description: "Set and adjust pricing rules based on various factors.",
                icon: "/placeholder.svg?height=80&width=80&query=price%20tag%20icon%20teal",
                delay: 0.3,
              },
              {
                title: "Multi-tenant Support",
                description: "Manage multiple organizations with isolated data.",
                icon: "/placeholder.svg?height=80&width=80&query=building%20icon%20teal",
                delay: 0.4,
              },
              {
                title: "Reporting & Analytics",
                description: "Gain insights with comprehensive reporting tools.",
                icon: "/placeholder.svg?height=80&width=80&query=chart%20icon%20teal",
                delay: 0.5,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="relative bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] shadow-lg group hover:border-[#00ae98]/50 transition-all duration-300"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ae98]/0 via-[#00ae98]/10 to-[#00ae98]/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 w-16 h-16 flex items-center justify-center">
                    <Image
                      src={feature.icon || "/placeholder.svg"}
                      width={80}
                      height={80}
                      alt={feature.title}
                      className="transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#00ae98]">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="relative inline-block">
                Simple, Transparent Pricing
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#00ae98]/0 via-[#00ae98] to-[#00ae98]/0"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Choose the plan that's right for your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Starter",
                price: "$49",
                description: "Perfect for small businesses just getting started.",
                features: ["Up to 50 vehicles", "Basic assessments", "Email support"],
                popular: false,
                delay: 0,
              },
              {
                title: "Professional",
                price: "$99",
                description: "Ideal for growing businesses with more needs.",
                features: ["Up to 200 vehicles", "Advanced assessments", "Priority support", "AI Booking system"],
                popular: true,
                delay: 0.2,
              },
              {
                title: "Enterprise",
                price: "Custom",
                description: "For large organizations with complex requirements.",
                features: ["Unlimited vehicles", "Custom assessments", "Dedicated support", "Full feature access"],
                popular: false,
                delay: 0.4,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: plan.delay }}
                className={`relative bg-[#1a1a1a] rounded-xl overflow-hidden border ${plan.popular ? "border-[#00ae98]" : "border-[#2a2a2a]"}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[#00ae98] text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? "pt-12" : ""}`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-400 ml-1">/month</span>}
                  </div>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-[#00ae98] mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? "bg-[#00ae98] text-white hover:bg-[#00ae98]/80 shadow-[0_0_20px_rgba(0,174,152,0.3)]"
                        : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212] to-[#121212]"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="w-full h-full bg-[url('/placeholder.svg?height=1080&width=1920&query=abstract%20digital%20network%20with%20teal%20nodes')] bg-cover bg-center opacity-10"></div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-xl p-10 border border-[#2a2a2a] shadow-[0_0_30px_rgba(0,174,152,0.2)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Vehicle Assessment Process?
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of businesses that trust SlickAssess to streamline their operations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 rounded-lg bg-[#00ae98] text-white font-bold hover:bg-[#00ae98]/80 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,174,152,0.5)] text-center"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="#"
                className="px-8 py-4 rounded-lg border border-[#707070] text-white font-bold hover:border-[#00ae98] hover:text-[#00ae98] transition-all transform hover:scale-105 text-center"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#2a2a2a] relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="text-2xl font-bold text-white flex items-center">
                <span className="text-[#00ae98] mr-1">Slick</span>Assess
              </Link>
              <p className="mt-4 text-gray-400">The comprehensive platform for vehicle assessment and management.</p>
              <div className="mt-4 flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-[#00ae98]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#2a2a2a]">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 SlickAssess. All rights reserved.</p>
              <div className="flex mt-4 md:mt-0 space-x-6">
                <Link href="#" className="text-sm text-gray-400 hover:text-[#00ae98]">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-[#00ae98]">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-[#00ae98]">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating scroll indicator */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-[#1a1a1a] p-3 rounded-full border border-[#2a2a2a] shadow-lg hover:border-[#00ae98] transition-colors z-50 group"
      >
        <ChevronDown className="h-5 w-5 transform rotate-180 group-hover:text-[#00ae98] transition-colors" />
      </button>
    </div>
  )
}
