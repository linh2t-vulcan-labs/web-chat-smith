import { Expose } from "@/libs/class-transformer";

export interface TGetListAssistantsDTO {
  next_page_token: string;
  assistants: {
    id: string;
    name: string;
  }[];
}

export class QueryListAssistantDTO {
  @Expose({ name: "pageSize" })
  page_size!: number;

  @Expose({ name: "pageToken" })
  page_token?: string;
}
