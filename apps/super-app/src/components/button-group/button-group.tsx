import React, { useEffect, useState } from "react";

import { TextButton } from "@/components/text-button";

import type { TButtonGroups } from "./types";

export default function ButtonGroup({
  value = "",
  options,
  onChange,
}: TButtonGroups) {
  const [selected, setSelected] = useState(value);

  const handleSelect = (value: string) => {
    setSelected(value);
    if (onChange) {
      onChange(value);
    }
  };

  useEffect(() => {
    if (!value) {
      return;
    }
    // oxlint-disable-next-line react/react-compiler -- effect re-syncs internal selection when the controlled `value` prop changes; idempotent derivation, false positive
    setSelected(value);
  }, [value]);

  return (
    <div className="flex flex-wrap gap-small-1">
      {options.map((option) => (
        <TextButton
          key={option.value}
          color={
            selected === option.value ? "primaryOutline" : "neutralOutline"
          }
          onClick={() => handleSelect(option.value)}
          {...(option.icon && {
            startIcon: option.icon,
          })}
        >
          {option.label}
        </TextButton>
      ))}
    </div>
  );
}
