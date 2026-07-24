import { fileServiceAPIs } from "@/core/repositories/file-service";
import { messageFeedbackServiceApis } from "@/core/repositories/message-feedback";
import { surveyServiceAPIs } from "@/core/repositories/survey-service";
import { AxiosClientBase, AxiosServerBase, HttpBase } from "@/libs/axios";
import { AuthTokenManager, GuestTokenManager } from "@/utils/token-manager";

import { assistantServiceAPIs } from "./assistant-service";
import { assistantWritingServiceAPIs } from "./assistant-writing-service";
import { conversationServiceAPIs } from "./converations-service";
import { notificationServiceAPIs } from "./notification-service";
import { orderServiceAPIs } from "./order-service";
import { paymentServiceAPIs } from "./payment-service";
import { productServiceAPIs } from "./product-service";
import { subscriptionServiceAPIs } from "./subscription-service";
import { usageServiceAPIs } from "./usage-service";
import { userServiceAPIs } from "./user-service";

const authTokenManager = new AuthTokenManager();
const guestTokenManager = new GuestTokenManager();

const axiosFetchClient = new HttpBase(
  new AxiosClientBase(authTokenManager).getInstance()
);
const axiosFetchServer = new HttpBase(new AxiosServerBase().getInstance());

const conversationServerService = conversationServiceAPIs(axiosFetchServer);
const assistantWritingServerService =
  assistantWritingServiceAPIs(axiosFetchServer);
const paymentServerService = paymentServiceAPIs(axiosFetchServer);
const userServerService = userServiceAPIs(axiosFetchServer);
const userServerServiceWithFetch = userServiceAPIs(axiosFetchServer);
const subscriptionServerService = subscriptionServiceAPIs(axiosFetchServer);
const productServerService = productServiceAPIs(axiosFetchServer);
const orderServerService = orderServiceAPIs(axiosFetchServer);
const assistantServerService = assistantServiceAPIs(axiosFetchServer);
const usageServerService = usageServiceAPIs(axiosFetchServer);

const fileClientService = fileServiceAPIs(axiosFetchClient);
const conversationClientService = conversationServiceAPIs(axiosFetchClient);
const userClientService = userServiceAPIs(axiosFetchClient);
const assistantWritingClientService =
  assistantWritingServiceAPIs(axiosFetchClient);
const assistantClientService = assistantServiceAPIs(axiosFetchClient);
const subscriptionClientService = subscriptionServiceAPIs(axiosFetchClient);
const productClientService = productServiceAPIs(axiosFetchClient);
const orderClientService = orderServiceAPIs(axiosFetchClient);
const paymentClientService = paymentServiceAPIs(axiosFetchClient);
const messageFeedbackClientService =
  messageFeedbackServiceApis(axiosFetchClient);
const surveyClientService = surveyServiceAPIs(axiosFetchClient);
const notificationService = notificationServiceAPIs(axiosFetchClient);
const usageClientService = usageServiceAPIs(axiosFetchClient);

export {
  conversationServerService,
  assistantWritingServerService,
  paymentServerService,
  subscriptionServerService,
  userServerService,
  userServerServiceWithFetch,
  productServerService,
  orderServerService,
  assistantServerService,
  usageServerService,
  // Client
  fileClientService,
  conversationClientService,
  userClientService,
  assistantClientService,
  assistantWritingClientService,
  subscriptionClientService,
  productClientService,
  orderClientService,
  paymentClientService,
  messageFeedbackClientService,
  surveyClientService,
  notificationService,
  usageClientService,
  // Token Manager
  authTokenManager,
  guestTokenManager,
};
