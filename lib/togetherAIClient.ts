import { Together } from "together-ai"

export class TogetherAIClient {
  private together: Together

  constructor() {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    })
  }

  async createChatCompletion(messages: any[], tools?: any[]) {
    try {
      return await this.together.chat.completions.create({
              model: "Qwen/Qwen2-1.5B-Instruct",
              messages,
              tools,
              tool_choice: tools ? "auto" : "none",
              temperature: 0.7,
              max_tokens: 1000,
            });

    } catch (error) {
      console.error("Error creating chat completion:", error)
      throw error
    }
  }
}

export const togetherAIClient = new TogetherAIClient()
