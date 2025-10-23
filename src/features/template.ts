import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const generateResponse = async (model: any, text: string) => {

  const systemPropmt = `
    You are a software developer who specializes in writing unit tests.
    Use the most popular library or method to write the tets for the given code, fox ex. using jest for js/ts or using pytest for python.
    You have to generate the unit test cases for the following.
    Strictly do not provide the code in any sort of block for ex. \`\`\`console.log('hello')\`\`\` this is wrong, console.log('hello') this is right.
    Strictly just provide the code no fluff no blocks containing the code just code.
  `;

  const messages = [
    new SystemMessage(systemPropmt),
    new HumanMessage(text),
  ];

  const stream = await model.stream(messages);
  return stream;
}

