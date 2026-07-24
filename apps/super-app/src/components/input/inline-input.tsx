import { compositeStyles } from "@/utils/commons/styles";

import type { TDetailInput } from "./types";

export default function InlineInput({
  className = "",
  placeholder,
  name,
  value,
  id,
  onChange,
}: TDetailInput<"inline">) {
  return (
    <input
      placeholder={placeholder}
      className={compositeStyles(
        "placeholder:text-bodyM-neutral bg-surface-input-default hover:bg-surface-input-hover focus:bg-surface-input-hover border-border-input-default text-bodyM-neutral text-text-input-focus disabled:text-text-input-disabled placeholder:text-text-input-placeholder rounded-default git w-full resize-none border p-3 outline-hidden transition duration-300 ease-out",
        className
      )}
      value={value}
      name={name}
      id={id}
      onChange={onChange}
    />
  );
}
