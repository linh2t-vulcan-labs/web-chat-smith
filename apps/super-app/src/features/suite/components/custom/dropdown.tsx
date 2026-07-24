"use client";

import { cn } from "@/components/utils/cn";
import DropdownIcon from "@/features/suite/assets/icons/dropdown-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  className?: string;
  hasScrollBar?: boolean;
}

export function Dropdown({
  label,
  value,
  options,
  onValueChange,
  className,
  hasScrollBar = false,
}: DropdownProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "";

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v || "")}>
      <SelectTrigger
        data-testid={DATA_TEST_ID.suite.custom.dropdown}
        className={cn(
          "rounded-v1-pill px-v1-structural-content-tight py-v1-optical-normal text-functional-scale-1 h-8 border-none bg-transparent shadow-none",
          "text-v1-text-hierarchy-primary hover:bg-transparent focus-visible:ring-0",
          className
        )}
        icon={
          <span className="-mb-2.75 inline-flex transition-transform duration-200 ease-out data-popup-open:rotate-180">
            <DropdownIcon
              className="text-v1-icons-hierarchy-secondary size-3"
              aria-hidden
            />
          </span>
        }
      >
        <span className="text-body-scale-200 text-v1-text-hierarchy-secondary opacity-60">
          {label}:
        </span>
        <SelectValue className="text-body-scale-200 text-v1-text-hierarchy-primary border-v1-border-interactive-active data-placeholder:border-v1-border-structural-default min-h-5 min-w-17.5 border-b border-dotted">
          {selectedLabel}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        side="bottom"
        align="end"
        alignItemWithTrigger={false}
        showScrollButtons={!hasScrollBar}
        alignOffset={0}
        sideOffset={8}
        className={cn(
          "rounded-v1-large! border-v1-border-structural-subtle bg-v1-dropdown-background-primary w-fit min-w-0 border-2",
          "p-v1-structural-content-micro max-h-42! shadow-none ring-0",
          hasScrollBar &&
            "[&::-webkit-scrollbar-track]:my-v1-structural-content-tight! [&::-webkit-scrollbar-thumb]:bg-v1-surface-glass-dark-airy! [&::-webkit-scrollbar-thumb]:rounded-v1-pill! overflow-y-scroll! [scrollbar-color:auto]! [scrollbar-width:auto]! [&::-webkit-scrollbar]:w-3! [&::-webkit-scrollbar-thumb]:border-4! [&::-webkit-scrollbar-thumb]:border-solid! [&::-webkit-scrollbar-thumb]:border-transparent! [&::-webkit-scrollbar-thumb]:bg-clip-content! [&::-webkit-scrollbar-track]:bg-transparent!"
        )}
      >
        <SelectGroup className="p-0">
          {options.map((option) => (
            <SelectItem
              className={cn(
                "rounded-v1-pill ps-v1-structural-content-tight py-v1-optical-normal pe-v1-structural-content-micro min-h-8",
                "text-functional-scale-1 text-v1-text-hierarchy-primary text-start",
                "hover:bg-v1-surface-overlay-interactive-hover hover:rounded-v1-circle focus:rounded-v1-circle focus:bg-v1-surface-overlay-interactive-hover focus:text-v1-text-hierarchy-primary",
                "data-[selected=true]:bg-v1-surface-overlay-interactive-selected",
                "[&>span:last-child]:hidden"
              )}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
