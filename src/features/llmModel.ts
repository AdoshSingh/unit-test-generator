import { modelMapping } from "../utils/constants.js";

export class LlmModel {
  model: any;
  apiKey: string;
  public static instance: LlmModel;

  private constructor(model: string, apiKey: string) {
    const ModelClass = modelMapping[model];
    this.model = new ModelClass({model, apiKey});
    this.apiKey = apiKey;
  }

  public static initializeInstance(model: string, apiKey: string) {
    if(!LlmModel.instance) {
      LlmModel.instance = new LlmModel(model, apiKey);
    }
    return LlmModel.instance;
  }

  public static getInstance() {
    if (!LlmModel.instance) {
      throw new Error('LlmModel is not initialized. Call initializeFromConfig first.');
    }
    return LlmModel.instance;
  }
}