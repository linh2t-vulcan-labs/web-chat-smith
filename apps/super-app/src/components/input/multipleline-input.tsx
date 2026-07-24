import { compositeStyles } from "@/utils/commons/styles";

import type { TDetailInput } from "./types";

export default function MultipeLineInput({
  className = "",
  placeholder,
  name,
  value,
  rows,
  id,
  onChange,
}: TDetailInput<"multiple">) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      rows={rows}
      className={compositeStyles(
        "bg-surface-input-default hover:bg-surface-input-hover focus:bg-surface-input-hover border-border-input-default text-bodyM-neutral text-text-input-focus disabled:text-text-input-disabled placeholder:text-bodyM-neutral placeholder:text-text-input-placeholder rounded-default w-full resize-none border p-3 outline-hidden transition duration-300 ease-out",
        className
      )}
      value={value}
      onChange={onChange}
    />
  );
}
