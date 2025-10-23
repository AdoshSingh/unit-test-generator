import { ChatOpenAI } from "@langchain/openai";

export const modelMapping: {[key: string]: any} = {
  "gpt-3.5-turbo": ChatOpenAI,
  "gpt-4": ChatOpenAI
}

export const models = ['gpt-4', 'gpt-3.5-turbo']