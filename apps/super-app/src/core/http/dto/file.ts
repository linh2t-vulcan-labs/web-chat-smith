import { Exclude, Expose, Type } from "@/libs/class-transformer";

@Exclude()
export class CreateUploadFileLinkDTO {
  @Expose({ name: "fileSize" })
  @Type(() => Number)
  file_size!: number;

  @Expose({ name: "mimeType" })
  mime_type!: string;

  @Expose({ name: "fileName" })
  file_name!: string;
}
