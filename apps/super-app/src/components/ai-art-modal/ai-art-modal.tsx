import { useDebounce } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import React, { useMemo, useState } from "react";

import { AIArtCard } from "@/components/ai-art-card";
import { Input } from "@/components/input";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type { TSelectedAIArt } from "@/core/models/conversation";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";

interface TAIArtModalProps {
  options: TAIArtOptions[];
  open: boolean;
  selectedAIArt: TSelectedAIArt;
  seenAIArtItems: EAIART_STYLE[];
  onClose: () => void;
  onClickAIArt: (id: string) => void;
}

const AIArtModal = ({
  open,
  options,
  selectedAIArt,
  seenAIArtItems,
  onClose,
  onClickAIArt,
}: TAIArtModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const conversationT = useTranslations("conversationPage");

  const handleSearchTerm = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return options;
    }

    return options.filter((option) =>
      option.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [options, debouncedSearchTerm]);

  return (
    <ModalV2
      containerClassName="md:max-w-[800px] size-full"
      className="gap-medium-3 flex size-full flex-col p-0!"
      open={open}
      onClose={onClose}
    >
      <div className="px-medium-2 pt-medium-3 flex items-center justify-between">
        <p className="text-title1 text-text-general-secondary flex-1">
          {conversationT("modal.chooseStyle.title")}
        </p>
        <SVGIcon
          src="/icons/close.svg"
          className="text-icon-general-tertiary hover:cursor-pointer hover:brightness-90"
          width={24}
          height={24}
          onClick={onClose}
        />
      </div>
      <div className="gap-large-4 flex h-full min-h-0 flex-1 flex-col">
        <div className="px-medium-2">
          <Input
            className="h-[44px]"
            inputClassName="placeholder:text-text-input-placeholder! placeholder:text-bodyS-neutral pl-[40px]! border-border-general-primary! rounded-rounded"
            id="ai-art-search"
            startIcon={
              <SVGIcon
                src="/icons/search.svg"
                className="text-icon-general-tertiary"
                width={20}
                height={20}
              />
            }
            typeInput="inline"
            placeholder={conversationT("input.placeholder.search")}
            value={searchTerm}
            onChange={handleSearchTerm}
          />
        </div>
        <div className="gap-medium-2 px-medium-2 pb-medium-3 grid grid-cols-1 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
          {filteredOptions.map((option) => {
            const isSelected = option.id === selectedAIArt.id;
            const hasSeen = seenAIArtItems.includes(option.value);

            if (!option.isEnabled) {
              return null;
            }

            return (
              <div key={option.id} className="aspect-square w-full">
                <AIArtCard
                  image={option.image}
                  gifImage={option.gifImage}
                  title={option.title}
                  description={option.description}
                  isNew={option.isNew && !hasSeen}
                  isSelected={isSelected}
                  onClick={() => onClickAIArt(option.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </ModalV2>
  );
};

export default AIArtModal;
