"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="group relative overflow-hidden border-gray-800 bg-black/50 transition-all duration-300 hover:border-[#00ae98]/50 hover:shadow-[0_0_30px_rgba(0,174,152,0.2)]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00ae98]/10 blur-3xl transition-all duration-500 group-hover:bg-[#00ae98]/20"></div>
        <CardHeader>
          <div className="mb-4 text-[#00ae98]">{icon}</div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-400">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
