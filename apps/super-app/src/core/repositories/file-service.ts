import { getRuntimeEnv } from "@cs/env/universal";

import { CreateUploadFileLinkModel, GetFileModel } from "@/core/models/file";
import type { THttp } from "@/core/models/http";
import type { TFileServiceAPI } from "@/core/ports/file";
import { TransformerBuilder } from "@/libs/class-transformer";
import { getMimeTypeFromFile } from "@/utils/commons/helpers";
import { mappingFileFromMetadataDTO } from "@/utils/mappers/conversations";

import type { TFileMessageDTO } from "../http/dto/conversation";
import { CreateUploadFileLinkDTO } from "../http/dto/file";

const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const fileServiceAPIs = (client: THttp): TFileServiceAPI => ({
  createFilesByUrl: async (urls) => {
    const [error, result] = await client.post<{ files: TFileMessageDTO[] }>(
      "api/v1/users/web/files/from-urls",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          urls,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const transformData = mappingFileFromMetadataDTO(result.files);
    return [null, transformData];
  },
  getFileUrl: async (fileId) => {
    const [errorGetLinkFile, getLinkResponse] = await client.get(
      `/api/v1/users/web/files/${fileId}/download`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (errorGetLinkFile) {
      return [errorGetLinkFile, null];
    }

    const downloadFileLinkModel = new TransformerBuilder(GetFileModel)
      .format(getLinkResponse, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainCamelCase() as GetFileModel;

    return [null, downloadFileLinkModel];
  },
  uploadFile: async (file) => {
    const mimeType = getMimeTypeFromFile(file.name, file.type);

    const createUploadLinkPayload = new TransformerBuilder(
      CreateUploadFileLinkDTO
    )
      .format(
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as CreateUploadFileLinkDTO;

    const [error, result] = await client.post<{
      data: CreateUploadFileLinkModel;
    }>("/api/v1/users/web/files", {
      baseURL: getSmithEngineServiceUrl(),
      body: {
        ...createUploadLinkPayload,
      },
    });

    if (error) {
      return [error, null];
    }

    const uploadFileLinkModel = new TransformerBuilder(
      CreateUploadFileLinkModel
    )
      .format(result, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainCamelCase() as CreateUploadFileLinkModel;

    const formData = new FormData();

    formData.append("key", uploadFileLinkModel.uploadPolicy.key);
    formData.append("policy", uploadFileLinkModel.uploadPolicy.policy);
    formData.append(
      "x-goog-algorithm",
      uploadFileLinkModel.uploadPolicy.xGoogAlgorithm
    );
    formData.append(
      "x-goog-credential",
      uploadFileLinkModel.uploadPolicy.xGoogCredential
    );
    formData.append("x-goog-date", uploadFileLinkModel.uploadPolicy.xGoogDate);
    formData.append(
      "x-goog-signature",
      uploadFileLinkModel.uploadPolicy.xGoogSignature
    );
    formData.append("file", file);

    const [errorUploadToGCS, _] = await client.post(
      uploadFileLinkModel.uploadUrl,
      {
        body: formData,
        enabledAuth: false,
        mode: "no-cors",
      }
    );

    if (errorUploadToGCS) {
      return [errorUploadToGCS, null];
    }

    return [null, { fileId: uploadFileLinkModel.fileId }];
  },
});
