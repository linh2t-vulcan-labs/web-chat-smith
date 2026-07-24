import { messageFeedbackUseCases } from "@/core/usecases/message-feedback";
import { surveyUseCases } from "@/core/usecases/survey";

import { conversationUseCases } from "./conversation";
import { fileUseCases } from "./file";
import { productUseCases } from "./product";
import { threadUseCases } from "./thread";
import { userUseCases } from "./user";

const conversationUC = conversationUseCases();
const threadUC = threadUseCases();
const fileUC = fileUseCases();
const productUC = productUseCases();
const messageFeedbackUC = messageFeedbackUseCases();
const surveyUC = surveyUseCases();
const userUC = userUseCases();

export {
  threadUC,
  conversationUC,
  fileUC,
  productUC,
  messageFeedbackUC,
  surveyUC,
  userUC,
};
