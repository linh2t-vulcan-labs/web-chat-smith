"use client";

import React, { forwardRef } from "react";

import type { TSwitchProps } from "./types";

const Switch = forwardRef<HTMLInputElement, TSwitchProps>(
  ({ checked, disabled, onChange, ariaLabel = "Toggle switch" }, ref) => (
    // GU-1573
    <label
      aria-label={ariaLabel}
      className="inline-flex cursor-pointer items-center"
    >
      <input
        ref={ref}
        type="checkbox"
        value=""
        className="peer sr-only"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      <div className="peer-checked:bg-surface-inputControl-highlight-default bg-surface-general-bright-overlay peer relative h-6 w-11 rounded-full after:absolute after:inset-s-[2px] after:top-0.5 after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600" />
    </label>
  )
);

Switch.displayName = "Switch";

export default Switch;
