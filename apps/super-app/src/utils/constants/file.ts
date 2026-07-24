export enum EFileExtension {
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
  PDF = "pdf",
  DOC = "doc",
  DOCX = "docx",
  XLS = "xls",
  XLSX = "xlsx",
  TXT = "txt",
  CSV = "csv",
  DOCS = "docs", // Google Docs
  JSON = "json",
}

export const LIST_IMAGE_FILE_ENUM = [
  EFileExtension.JPG,
  EFileExtension.JPEG,
  EFileExtension.PNG,
];

export const extensionToMimeTypeMap: Record<EFileExtension, string> = {
  [EFileExtension.JPG]: "image/jpg",
  [EFileExtension.JPEG]: "image/jpeg",
  [EFileExtension.PNG]: "image/png",
  [EFileExtension.WEBP]: "image/webp",
  [EFileExtension.PDF]: "application/pdf",
  [EFileExtension.DOC]: "application/msword",
  [EFileExtension.DOCX]:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  [EFileExtension.XLS]: "application/vnd.ms-excel",
  [EFileExtension.XLSX]:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [EFileExtension.TXT]: "text/plain",
  [EFileExtension.CSV]: "text/csv",
  [EFileExtension.DOCS]: "application/vnd.google-apps.document", // Google Docs
  [EFileExtension.JSON]: "application/json",
};
