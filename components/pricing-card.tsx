"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  delay?: number
  popular?: boolean
}

export function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  delay = 0,
  popular = false,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex"
    >
      <Card
        className={`relative flex w-full flex-col border-gray-800 bg-black/50 transition-all duration-300 hover:border-[#00ae98]/50 hover:shadow-[0_0_30px_rgba(0,174,152,0.2)] ${
          popular ? "border-[#00ae98]/50 shadow-[0_0_30px_rgba(0,174,152,0.2)]" : ""
        }`}
      >
        {popular && (
          <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-[#00ae98] px-3 py-1 text-xs font-medium text-black">
            Most Popular
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-5xl font-extrabold">{price}</span>
            <span className="ml-1 text-gray-400">/month</span>
          </div>
          <CardDescription className="mt-4 text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="mb-8 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="mr-3 h-5 w-5 text-[#00ae98]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full ${
              popular ? "bg-[#00ae98] text-white hover:bg-[#00c9b0]" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
