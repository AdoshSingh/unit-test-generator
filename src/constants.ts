import { ChatOpenAI } from "@langchain/openai";

export const modelMapping: {[key: string]: any} = {
  "gpt-4": ChatOpenAI
}