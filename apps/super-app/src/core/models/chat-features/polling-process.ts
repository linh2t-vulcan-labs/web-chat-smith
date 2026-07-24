import { Expose } from "@/libs/class-transformer";

export class WebSearchChatResponseModel {
  @Expose({ name: "process_id" })
  processId!: string;
}
