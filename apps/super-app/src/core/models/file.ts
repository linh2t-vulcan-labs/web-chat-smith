import { Exclude, Expose, Type } from "@/libs/class-transformer";

@Exclude()
class UploadFilePolicyModel {
  @Expose()
  key!: string;

  @Expose()
  policy!: string;

  @Expose({ name: "x-goog-algorithm" })
  xGoogAlgorithm!: string;

  @Expose({ name: "x-goog-credential" })
  xGoogCredential!: string;

  @Expose({ name: "x-goog-date" })
  xGoogDate!: string;

  @Expose({ name: "x-goog-signature" })
  xGoogSignature!: string;
}

@Exclude()
export class CreateUploadFileLinkModel {
  @Expose({ name: "file_id" })
  fileId!: string;

  @Expose({ name: "upload_url" })
  uploadUrl!: string;

  @Expose({ name: "upload_policy" })
  @Type(() => UploadFilePolicyModel)
  uploadPolicy!: UploadFilePolicyModel;
}

@Exclude()
export class GetFileModel {
  @Expose({ name: "file_id" })
  fileId!: string;

  @Expose({ name: "download_url" })
  fileUrl!: string;
}

export interface TUploadFileLinkResponse {
  fileId: string;
}
