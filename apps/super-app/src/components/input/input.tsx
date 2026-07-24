import { compositeStyles } from "@/utils/commons/styles";

import InlineInput from "./inline-input";
import MultipeLineInput from "./multipleline-input";
import type {
  HandleChangeInput,
  HandleChangeTextarea,
  TInput,
  TTypeInput,
} from "./types";

export default function Input<T extends TTypeInput>({
  typeInput,
  placeholder,
  name,
  value,
  rows = 1,
  id,
  startIcon,
  onChange,
  className,
  inputClassName,
}: TInput<T>) {
  return (
    <div
      className={compositeStyles(
        "items-ends relative flex size-full flex-row",
        className
      )}
    >
      {startIcon && (
        <div className="start-medium-1.5 absolute flex size-[24px] h-full items-center">
          {startIcon}
        </div>
      )}
      {typeInput === "inline" ? (
        <InlineInput
          className={compositeStyles(
            startIcon ? "pl-[44px]" : "",
            inputClassName
          )}
          value={value}
          placeholder={placeholder}
          name={name}
          id={id}
          onChange={onChange as HandleChangeInput}
        />
      ) : (
        <MultipeLineInput
          className={compositeStyles(
            startIcon ? "pl-[44px]" : "",
            inputClassName
          )}
          value={value}
          rows={rows}
          placeholder={placeholder}
          name={name}
          id={id}
          onChange={onChange as HandleChangeTextarea}
        />
      )}
    </div>
  );
}
