import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import {
  SuiteCreativeCompleteUploadPayloadDTO,
  SuiteCreativeCreateUploadPayloadDTO,
  SuiteCreativeListUploadsQueryDTO,
  SuiteCreativeUploadModel,
} from "@/features/suite/types/design-studio";
import type {
  TSuiteCreativeCompleteUploadResponseDTO,
  TSuiteCreativeCreateUploadResponseDTO,
  TSuiteCreativeGetUploadResponseDTO,
  TSuiteCreativeListUploadsResponseDTO,
  TSuiteCreativeUploadDTO,
  TSuiteCreativeUploadServiceAPIs,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

import { UPLOAD_STATUS_MAP } from "./constants";

function normalizeUploadDTO(
  upload: TSuiteCreativeUploadDTO
): TSuiteCreativeUploadDTO {
  return {
    ...upload,
    status: UPLOAD_STATUS_MAP[upload.status as string] ?? upload.status,
  };
}

function transformUpload(
  upload: TSuiteCreativeUploadDTO
): SuiteCreativeUploadModel {
  return new TransformerBuilder(SuiteCreativeUploadModel)
    .format(normalizeUploadDTO(upload), {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeUploadModel;
}

function transformUploads(
  uploads: TSuiteCreativeUploadDTO[]
): SuiteCreativeUploadModel[] {
  return uploads.map(transformUpload);
}

export const suiteCreativeUploadServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeUploadServiceAPIs => ({
  completeUpload: async (input) => {
    const payload = new TransformerBuilder(
      SuiteCreativeCompleteUploadPayloadDTO
    )
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.post<TSuiteCreativeCompleteUploadResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.uploadComplete(input.uploadId),
        {
          body: payload,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformUpload(result.upload)];
  },

  createUpload: async (input) => {
    const payload = new TransformerBuilder(SuiteCreativeCreateUploadPayloadDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.post<TSuiteCreativeCreateUploadResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.uploads,
        {
          body: payload,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    const upload = transformUpload(result.upload);
    upload.uploadPolicy = result.upload.upload_policy;
    return [null, upload];
  },

  getUpload: async (input) => {
    const [error, result] =
      await client.get<TSuiteCreativeGetUploadResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.upload(input.uploadId)
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformUpload(result.upload)];
  },

  listUploads: async (input) => {
    const query = new TransformerBuilder(SuiteCreativeListUploadsQueryDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.get<TSuiteCreativeListUploadsResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.uploads,
        {
          params: query,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [
      null,
      {
        nextPageToken: result.next_page_token,
        uploads: transformUploads(result.uploads),
      },
    ];
  },
});

export const suiteCreativeUploadClientService =
  suiteCreativeUploadServiceAPIs(suiteHttpClient);
