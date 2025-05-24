"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Users,
  Cpu,
  Globe,
  Star,
  Play,
} from "lucide-react"

// Custom cursor component
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsHovering(target.tagName === "A" || target.tagName === "BUTTON" || target.classList.contains("interactive"))
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 bg-[#00ae98] rounded-full pointer-events-none z-[100] mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 2 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-[#00ae98] rounded-full pointer-events-none z-[99]"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  )
}

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#00ae98] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#00ae98] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#00ae98] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ae98" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

// Particle field component
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 174, 152, 0.5)"
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" />
}

// 3D Sphere component
const AnimatedSphere = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[600px] h-[600px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Sphere args={[1.5, 64, 64]}>
            <MeshDistortMaterial
              color="#00ae98"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>
    </div>
  )
}

// Navigation progress indicator
const NavigationProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] transform-origin-left z-[60]"
      style={{ scaleX }}
    />
  )
}

// Premium navigation component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50)
    })
    return unsubscribe
  }, [scrollY])

  const navItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "features", label: "Features", href: "#features" },
    { id: "solutions", label: "Solutions", href: "#solutions" },
    { id: "pricing", label: "Pricing", href: "#pricing" },
    { id: "testimonials", label: "Testimonials", href: "#testimonials" },
  ]

  return (
    <>
      <NavigationProgress />
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/10" : ""
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#00ae98] blur-xl opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#00ae98] to-[#00d4aa] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SlickAssess
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors interactive ${
                    activeSection === item.id ? "text-[#00ae98]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute inset-0 bg-[#00ae98]/10 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors interactive"
              >
                Sign In
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 text-sm font-medium text-white overflow-hidden rounded-lg group interactive"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative">Get Started</span>
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center interactive"
            >
              <div className="relative w-6 h-5">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="absolute top-0 left-0 w-full h-0.5 bg-white"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute top-2 left-0 w-full h-0.5 bg-white"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="absolute top-4 left-0 w-full h-0.5 bg-white"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10"
        >
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveSection(item.id)
                    setIsOpen(false)
                  }}
                  className="text-lg font-medium text-gray-300 hover:text-[#00ae98] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-4 border-t border-white/10">
                <button className="w-full py-3 text-center text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
                <button className="w-full py-3 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] text-white rounded-lg font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </>
  )
}

// Hero section with advanced animations
const HeroSection = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [currentWord, setCurrentWord] = useState(0)
  const words = ["Assessments", "Operations", "Workflow", "Business"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <ParticleField />

      <motion.div style={{ y, opacity, scale }} className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00ae98]/10 border border-[#00ae98]/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#00ae98]" />
              <span className="text-sm text-[#00ae98] font-medium">AI-Powered Vehicle Management</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="block text-white mb-2">Transform Your</span>
              <span className="relative block">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-[#00ae98] via-[#00d4aa] to-[#00ae98] bg-clip-text text-transparent bg-300% animate-gradient"
                >
                  {words[currentWord]}
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Experience the future of vehicle assessment with our cutting-edge platform. Powered by AI, designed for
              excellence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] rounded-xl font-semibold text-white overflow-hidden interactive"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white overflow-hidden interactive"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98]/20 to-[#00d4aa]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="relative h-[400px] md:h-[500px] mt-16"
          >
            <AnimatedSphere />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className="flex flex-col items-center space-y-2 text-gray-500"
        >
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Stats section with animated counters
const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    { value: 10000, suffix: "+", label: "Active Users", icon: Users },
    { value: 50000, suffix: "+", label: "Assessments", icon: BarChart3 },
    { value: 99.9, suffix: "%", label: "Uptime", icon: Zap },
    { value: 24, suffix: "/7", label: "Support", icon: Shield },
  ]

  return (
    <section ref={sectionRef} className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98]/20 to-[#00d4aa]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-[#00ae98] mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {isVisible && <CountUp end={stat.value} suffix={stat.suffix} />}
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Animated counter component
const CountUp = ({ end, suffix }: { end: number; suffix: string }) => {
  const [count, setCount] = useState(0)
  const duration = 2000
  const steps = 60

  useEffect(() => {
    let current = 0
    const increment = end / steps
    const stepDuration = duration / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [end])

  return (
    <>
      {count.toFixed(end % 1 !== 0 ? 1 : 0)}
      {suffix}
    </>
  )
}

// Features section with interactive cards
const FeaturesSection = () => {
  const features = [
    {
      icon: Cpu,
      title: "AI-Powered Intelligence",
      description:
        "Advanced machine learning algorithms analyze vehicle data to provide accurate assessments and predictions.",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: Globe,
      title: "Global Fleet Management",
      description: "Manage vehicles across multiple locations with real-time tracking and comprehensive reporting.",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols ensure your data is always protected and compliant.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with instant loading times and real-time updates across all devices.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive dashboards with actionable insights to optimize your operations and increase revenue.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Built-in tools for seamless team communication and workflow management across departments.",
      gradient: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00ae98]/10 border border-[#00ae98]/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#00ae98]" />
            <span className="text-sm text-[#00ae98] font-medium">Powerful Features</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-[#00ae98] to-[#00d4aa] bg-clip-text text-transparent">
              Succeed at Scale
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our comprehensive suite of tools is designed to handle the complexity of modern vehicle management while
            maintaining simplicity in user experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98]/20 to-[#00d4aa]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00ae98]/10 to-transparent rounded-full blur-2xl" />

                <div
                  className={`relative w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                <motion.div
                  className="mt-6 flex items-center text-[#00ae98] font-medium cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Learn more
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Interactive demo section
const DemoSection = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "vehicles", label: "Vehicles", icon: Cpu },
    { id: "analytics", label: "Analytics", icon: Globe },
  ]

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">See It In Action</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the power and simplicity of our platform with this interactive demo.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Tab navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center space-x-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Demo content */}
          <motion.div style={{ y }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98]/20 to-[#00d4aa]/20 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="p-8">
                <Image
                  src={`/placeholder.svg?height=600&width=1200&query=modern%20${activeTab}%20interface%20dark%20theme%20teal%20accents`}
                  width={1200}
                  height={600}
                  alt={`${activeTab} demo`}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Testimonials section with carousel
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fleet Manager",
      company: "AutoFleet Pro",
      image: "/placeholder.svg?height=100&width=100&query=professional%20woman%20headshot",
      content:
        "SlickAssess has revolutionized how we manage our fleet. The AI-powered insights have helped us reduce costs by 35% in just 6 months.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      company: "Global Transport Inc",
      image: "/placeholder.svg?height=100&width=100&query=professional%20man%20headshot",
      content:
        "The platform's intuitive design and powerful features make it indispensable for our daily operations. Couldn't imagine working without it.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "CEO",
      company: "Swift Logistics",
      image: "/placeholder.svg?height=100&width=100&query=professional%20woman%20executive%20headshot",
      content:
        "Best investment we've made. The ROI was evident within the first month. Customer support is exceptional too.",
      rating: 5,
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <section id="testimonials" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00ae98]/10 border border-[#00ae98]/30 rounded-full mb-6"
          >
            <Star className="w-4 h-4 text-[#00ae98]" />
            <span className="text-sm text-[#00ae98] font-medium">Customer Success Stories</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Trusted by Industry Leaders</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what our customers have to say about their experience with SlickAssess.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0,
                  scale: index === currentIndex ? 1 : 0.8,
                  display: index === currentIndex ? "block" : "none",
                }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#00ae98] fill-current" />
                    ))}
                  </div>

                  <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed">"{testimonial.content}"</p>

                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      width={60}
                      height={60}
                      alt={testimonial.name}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-[#00ae98]" : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing section with interactive cards
const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses",
      price: { monthly: 49, annual: 39 },
      features: ["Up to 50 vehicles", "Basic assessments", "Email support", "Mobile app access", "Basic analytics"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      description: "For growing businesses",
      price: { monthly: 99, annual: 79 },
      features: [
        "Up to 200 vehicles",
        "Advanced assessments",
        "Priority support",
        "AI-powered insights",
        "Advanced analytics",
        "API access",
        "Custom integrations",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: { monthly: "Custom", annual: "Custom" },
      features: [
        "Unlimited vehicles",
        "Custom assessments",
        "Dedicated support",
        "Full feature access",
        "Custom training",
        "SLA guarantee",
        "White-label options",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-32 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00ae98]/10 border border-[#00ae98]/30 rounded-full mb-6"
          >
            <Zap className="w-4 h-4 text-[#00ae98]" />
            <span className="text-sm text-[#00ae98] font-medium">Simple, Transparent Pricing</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Choose Your Plan</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === "monthly" ? "bg-[#00ae98] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === "annual" ? "bg-[#00ae98] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-[#00ae98]/20 text-[#00ae98] px-2 py-1 rounded-full">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-[#00ae98] to-[#00d4aa] text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`relative h-full bg-white/5 backdrop-blur-sm border rounded-3xl p-8 transition-all ${
                  plan.popular
                    ? "border-[#00ae98] shadow-[0_0_30px_rgba(0,174,152,0.3)]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">
                      {typeof plan.price[billingCycle] === "number" ? "$" : ""}
                      {plan.price[billingCycle]}
                    </span>
                    {typeof plan.price[billingCycle] === "number" && (
                      <span className="ml-2 text-gray-400">/{billingCycle === "monthly" ? "month" : "year"}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-[#00ae98] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#00ae98] to-[#00d4aa] text-white hover:shadow-[0_0_20px_rgba(0,174,152,0.5)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA section with gradient background
const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ae98]/20 via-transparent to-[#00d4aa]/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ae98]/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-[#00ae98] to-[#00d4aa] bg-clip-text text-transparent">
              Vehicle Management?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust SlickAssess to streamline their operations and drive growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#00ae98] to-[#00d4aa] rounded-xl font-semibold text-white overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              <span className="relative flex items-center">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ae98]/20 to-[#00d4aa]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Schedule a Demo</span>
            </motion.button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#00ae98]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer with gradient accents
const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "Testimonials", "FAQ"],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Documentation", "API Reference", "Support", "Status"],
    Legal: ["Privacy", "Terms", "Security", "Compliance"],
  }

  return (
    <footer className="relative pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00ae98] blur-xl opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#00ae98] to-[#00d4aa] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white">SlickAssess</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              The most advanced vehicle assessment platform designed to transform your business operations.
            </p>
            <div className="flex space-x-4">
              {["twitter", "linkedin", "github", "youtube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#00ae98] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 SlickAssess. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#00ae98] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00ae98] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00ae98] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <CustomCursor />
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DemoSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
