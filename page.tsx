"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown, Code, Cpu, Database, Globe, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroParticles } from "./components/hero-particles"
import { FeatureCard } from "./components/feature-card"
import { PricingCard } from "./components/pricing-card"
import { Testimonial } from "./components/testimonial"
import { Footer } from "./components/footer"
import { Navbar } from "./components/navbar"

export default function Home() {
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Animation values
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9])
  const heroY = useTransform(scrollY, [0, 400], [0, 100])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-black text-white">
        {/* Hero Section */}
        <div className="relative min-h-screen">
          <HeroParticles />
          <motion.div
            ref={heroRef}
            className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-32 text-center"
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                Elevate Your Digital Experience with{" "}
                <span className="bg-gradient-to-r from-[#00ae98] to-[#00e6c8] bg-clip-text text-transparent">
                  Cutting-Edge Technology
                </span>
              </h1>
              <p className="mb-8 text-xl text-gray-400 md:text-2xl">
                Seamlessly integrate powerful features into your workflow with our innovative platform
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <Button size="lg" className="bg-[#00ae98] text-white hover:bg-[#00c9b0]">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-[#707070] text-white hover:bg-[#707070]/20">
                Learn More
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <ChevronDown className="h-8 w-8 animate-bounce text-[#00ae98]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="relative py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black to-gray-900"></div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 text-4xl font-bold md:text-5xl"
              >
                Powerful Features
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto max-w-2xl text-lg text-gray-400"
              >
                Our platform offers a comprehensive suite of tools designed to enhance your productivity
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap className="h-10 w-10" />}
                title="Lightning Fast Performance"
                description="Experience unparalleled speed with our optimized infrastructure"
                delay={0}
              />
              <FeatureCard
                icon={<Shield className="h-10 w-10" />}
                title="Enterprise-Grade Security"
                description="Your data is protected with state-of-the-art encryption and security measures"
                delay={0.1}
              />
              <FeatureCard
                icon={<Cpu className="h-10 w-10" />}
                title="AI-Powered Analytics"
                description="Gain valuable insights with our advanced machine learning algorithms"
                delay={0.2}
              />
              <FeatureCard
                icon={<Globe className="h-10 w-10" />}
                title="Global CDN"
                description="Content delivery optimized for users anywhere in the world"
                delay={0.3}
              />
              <FeatureCard
                icon={<Database className="h-10 w-10" />}
                title="Scalable Infrastructure"
                description="Grow without limits with our auto-scaling cloud architecture"
                delay={0.4}
              />
              <FeatureCard
                icon={<Code className="h-10 w-10" />}
                title="Developer-Friendly API"
                description="Integrate seamlessly with our comprehensive API documentation"
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 text-4xl font-bold md:text-5xl"
              >
                Simple, Transparent Pricing
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto max-w-2xl text-lg text-gray-400"
              >
                Choose the plan that works best for your needs
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <PricingCard
                title="Starter"
                price="$29"
                description="Perfect for small projects and individuals"
                features={["Up to 5 projects", "Basic analytics", "24/7 support", "1GB storage", "Community access"]}
                buttonText="Get Started"
                delay={0}
                popular={false}
              />
              <PricingCard
                title="Professional"
                price="$79"
                description="Ideal for growing businesses and teams"
                features={[
                  "Unlimited projects",
                  "Advanced analytics",
                  "Priority support",
                  "10GB storage",
                  "API access",
                  "Team collaboration",
                ]}
                buttonText="Get Started"
                delay={0.1}
                popular={true}
              />
              <PricingCard
                title="Enterprise"
                price="$199"
                description="For large organizations with complex needs"
                features={[
                  "Unlimited everything",
                  "Custom analytics",
                  "Dedicated support",
                  "100GB storage",
                  "Advanced API access",
                  "SSO integration",
                  "Custom branding",
                ]}
                buttonText="Contact Sales"
                delay={0.2}
                popular={false}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black to-gray-900"></div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 text-4xl font-bold md:text-5xl"
              >
                What Our Clients Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto max-w-2xl text-lg text-gray-400"
              >
                Trusted by thousands of companies worldwide
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Testimonial
                quote="This platform has completely transformed our workflow. The performance is incredible and the features are exactly what we needed."
                author="Sarah Johnson"
                role="CTO, TechCorp"
                image="/placeholder.svg?height=80&width=80&query=professional woman portrait"
                delay={0}
              />
              <Testimonial
                quote="The security features give us peace of mind, and the analytics have provided insights we never had before. Highly recommended!"
                author="Michael Chen"
                role="Director of Engineering, DataFlow"
                image="/placeholder.svg?height=80&width=80&query=professional man portrait"
                delay={0.1}
              />
              <Testimonial
                quote="We've tried many solutions, but nothing compares to the ease of use and power of this platform. It's been a game-changer for our team."
                author="Jessica Williams"
                role="Product Manager, InnovateX"
                image="/placeholder.svg?height=80&width=80&query=professional woman portrait business"
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 to-black"></div>
          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl bg-gradient-to-r from-gray-900 to-black p-12 shadow-[0_0_50px_rgba(0,174,152,0.3)]"
            >
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="mb-6 text-4xl font-bold md:text-5xl">Ready to Get Started?</h2>
                <p className="mb-8 text-xl text-gray-400">
                  Join thousands of satisfied users and take your project to the next level
                </p>
                <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Button size="lg" className="bg-[#00ae98] text-white hover:bg-[#00c9b0]">
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#707070] text-white hover:bg-[#707070]/20">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
