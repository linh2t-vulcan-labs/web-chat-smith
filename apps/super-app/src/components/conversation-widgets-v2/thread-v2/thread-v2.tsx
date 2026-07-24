import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useHandleClickOutside } from "@/hooks/ui/use-handle-click-outside";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Link } from "@/i18n/navigation";
import { compositeStyles } from "@/utils/commons/styles";

import { ThreadTitleV2 } from "../thread-title-v2";
import type { TThreadProps } from "./types";

const MenuThreadV2 = dynamic(() => import("./menu-thread-v2"));

export default memo(
  ({
    id,
    title,
    platform,
    isChatSyncEnabled,
    isMigrated = false,
    isActive = false,
    isDisabled = false,
    href,
    onClick,
    onRemove,
    onEdit,
  }: TThreadProps) => {
    const [isEdit, setIsEdit] = useState(false);
    const [titleVal, setTitleVal] = useState(title);
    const [isHovered, setIsHovered] = useState(false);
    const isDesktop = useMediaQuery("md");

    const {
      wrapperRef: menuTriggerRef,
      setIsVisible: setIsVisibleMenuThread,
      isVisible: isVisibleMenuThread,
    } = useHandleClickOutside<HTMLButtonElement>();

    const inputRef = useRef<HTMLInputElement | null>(null);
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 100;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (value.length <= MAX_LENGTH) {
        setTitleVal(e.target.value);
      }
    };

    const handleTitleBlur = () => {
      const trimmedTitle = titleVal.trim();

      if (trimmedTitle === title) {
        setIsEdit(false);
        return;
      }

      if (trimmedTitle.length < MIN_LENGTH) {
        setTitleVal(title);
        setIsEdit(false);
        return;
      }

      onEdit(id, trimmedTitle);
      setIsEdit(false);
    };

    const handleClickEditBtn = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (inputRef?.current) {
        inputRef.current.focus();
      }
      setIsEdit((prev) => !prev);
    };

    const handleClickTitle = () => {
      onClick(id);
    };

    const handleTitleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleTitleBlur();
      }
    };

    const handleClickTriggerNode = () => {
      setIsVisibleMenuThread(true);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const renderCloudIcon = () => {
      const cloudIcon = {
        sync: (
          <SvgIcon
            name="cloud-check"
            className="text-v1-icons-status-success"
            size={16}
          />
        ),
        sync_failed: (
          <SVGIcon
            src="/icons/outlined/cloud-sync-failed.svg"
            width={12}
            height={12}
          />
        ),
        sync_not: (
          <SVGIcon
            src="/icons/outlined/cloud-slash.svg"
            width={12}
            height={12}
          />
        ),
        sync_processing: (
          <SVGIcon
            src="/icons/outlined/cloud-syncing.svg"
            width={12}
            height={12}
          />
        ),
      };

      if (isMigrated || platform === "web_only") {
        return cloudIcon["sync_not"];
      }

      return cloudIcon["sync"];
    };

    useEffect(() => {
      if (title !== titleVal) {
        // oxlint-disable-next-line react/react-compiler -- effect re-syncs local title state when the `title` prop changes; guarded by equality check, idempotent
        setTitleVal(title);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title]);

    const isShowMenuThread =
      !isDesktop || (!isEdit && (isHovered || isVisibleMenuThread));

    return (
      <Link
        className={compositeStyles(
          isActive ? "bg-surface-input-hover" : "",
          isDisabled ? "pointer-events-none opacity-50" : "",
          "group rounded-soft p-v1-structural-content-tight focus-within:bg-surface-input-hover hover:bg-surface-input-hover relative z-1 flex w-full cursor-pointer flex-row justify-between gap-4 text-left"
        )}
        href={href}
        onClick={handleClickTitle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="gap-v1-structural-content-tight flex w-full flex-row items-center justify-between">
          <div
            className={compositeStyles(
              "gap-small-1 flex w-full items-center",
              isShowMenuThread ? "max-w-[calc(100%-30px)]" : ""
            )}
          >
            {isChatSyncEnabled && renderCloudIcon()}
            <ThreadTitleV2
              isEdit={isEdit}
              value={titleVal}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeydown}
            />
          </div>
          {isShowMenuThread && (
            <MenuThreadV2
              triggerRef={menuTriggerRef}
              id={id}
              isActive={isActive}
              onRemove={onRemove}
              onEdit={handleClickEditBtn}
              onClick={handleClickTriggerNode}
            />
          )}
        </div>
      </Link>
    );
  }
);
