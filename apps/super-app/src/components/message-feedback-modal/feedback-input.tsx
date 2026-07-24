import type { TFeedbackInputProps } from "./types";

export function FeedbackInput(props: TFeedbackInputProps) {
  const { placeholder, value, onChange } = props;
  return (
    <textarea
      id="feedback-input"
      className="p-medium-2 rounded-default bg-surface-general-soft text-footnoteM-neutral md:text-bodyM-neutral placeholder:text-footnoteM-neutral md:placeholder:text-bodyM-neutral! placeholder:text-text-input-placeholder/20! resize-none outline-hidden"
      placeholder={placeholder}
      value={value}
      maxLength={512}
      rows={3}
      onChange={onChange}
    />
  );
}
