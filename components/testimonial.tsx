"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  image: string
  delay?: number
}

export function Testimonial({ quote, author, role, image, delay = 0 }: TestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="h-full border-gray-800 bg-black/50 transition-all duration-300 hover:border-[#00ae98]/50 hover:shadow-[0_0_30px_rgba(0,174,152,0.2)]">
        <CardContent className="pt-6">
          <div className="mb-4 text-2xl text-[#00ae98]">"</div>
          <p className="mb-4 text-gray-300">{quote}</p>
        </CardContent>
        <CardFooter className="border-t border-gray-800 pt-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 border-2 border-[#00ae98]">
              <AvatarImage src={image || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-sm font-medium">{author}</p>
              <p className="text-xs text-gray-400">{role}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
