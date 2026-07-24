import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import {
  SuiteCreativeExportImagePayloadDTO,
  SuiteCreativeImageExportModel,
  SuiteCreativeImageModel,
  SuiteCreativeListImagesQueryDTO,
} from "@/features/suite/types/design-studio";
import type {
  SuiteCreativeImageGroupModel,
  TSuiteCreativeExportImageResponseDTO,
  TSuiteCreativeImageDTO,
  TSuiteCreativeImageGroupDTO,
  TSuiteCreativeImageServiceAPIs,
  TSuiteCreativeListImagesResponseDTO,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

function transformImages(
  images: TSuiteCreativeImageDTO[]
): SuiteCreativeImageModel[] {
  return new TransformerBuilder(SuiteCreativeImageModel)
    .format(images, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeImageModel[];
}

function transformImage(
  image: TSuiteCreativeImageDTO
): SuiteCreativeImageModel {
  return new TransformerBuilder(SuiteCreativeImageModel)
    .format(image, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeImageModel;
}

function transformImageGroups(
  groups: TSuiteCreativeImageGroupDTO[]
): SuiteCreativeImageGroupModel[] {
  return groups.map((group) => ({
    images: transformImages(group.images),
    messageId: group.message_id,
    template: group.template ? transformImage(group.template) : null,
  }));
}

function transformImageExport(
  imageExport: TSuiteCreativeExportImageResponseDTO
): SuiteCreativeImageExportModel {
  return new TransformerBuilder(SuiteCreativeImageExportModel)
    .format(imageExport, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeImageExportModel;
}

export const suiteCreativeImageServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeImageServiceAPIs => ({
  exportImage: async (input) => {
    const payload = new TransformerBuilder(SuiteCreativeExportImagePayloadDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.post<TSuiteCreativeExportImageResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.imageExport(
          input.projectId,
          input.imageId
        ),
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

    return [null, transformImageExport(result)];
  },

  listImages: async (input) => {
    const query = new TransformerBuilder(SuiteCreativeListImagesQueryDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.get<TSuiteCreativeListImagesResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.images(input.projectId),
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
        groups: transformImageGroups(result.groups ?? []),
        images: transformImages(result.images),
        nextPageToken: result.next_page_token,
      },
    ];
  },
});

export const suiteCreativeImageClientService =
  suiteCreativeImageServiceAPIs(suiteHttpClient);
