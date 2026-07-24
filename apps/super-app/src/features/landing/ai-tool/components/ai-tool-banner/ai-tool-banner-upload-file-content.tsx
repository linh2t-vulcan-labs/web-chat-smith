"use client";

import UploadFileIcon from "@/public/icons/landing-page/upload_file.svg?react";

import styles from "./styles.module.css";

export interface AIToolBannerUploadFileLabels {
  title: string;
  instructionPrefix: string;
  chooseFiles: string;
  instructionSuffix: string;
  supportedTypes: string;
  chooseFilesAriaLabel: string;
}

type Props = AIToolBannerUploadFileLabels & {
  onChooseFiles: () => void;
};

export function AIToolBannerUploadFileContent({
  title,
  instructionPrefix,
  chooseFiles,
  instructionSuffix,
  supportedTypes,
  chooseFilesAriaLabel,
  onChooseFiles,
}: Props) {
  return (
    <div className={styles.uploadFileFrame}>
      <div className={styles.uploadFileHeader}>
        <span className={styles.uploadFileTitle}>{title}</span>
      </div>

      <div className={styles.uploadFileDropzone}>
        <UploadFileIcon
          className={styles.uploadFileIcon}
          width={21}
          height={21}
          aria-hidden
          focusable={false}
        />

        <p className={styles.uploadFileInstruction}>
          {instructionPrefix}
          <button
            type="button"
            className={styles.uploadFileChooseLink}
            onClick={onChooseFiles}
            aria-label={chooseFilesAriaLabel}
          >
            {chooseFiles}
          </button>
          {instructionSuffix}
        </p>

        <p className={styles.uploadFileSubtext}>{supportedTypes}</p>
      </div>
    </div>
  );
}
