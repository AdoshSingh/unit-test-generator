import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const generateResponse = async (model: any, text: string) => {
  const messages = [
    new SystemMessage("Generate unit test cases for the following. Just provide the code and no other fluff."),
    new HumanMessage(text),
  ];

  const stream = await model.stream(messages);
  return stream;
}

