import { notFound } from "next/navigation";

import { AssistantMain } from "@/components/assistant-main";

export default function Page() {
  const isShowAssistantMain = false;

  // Note: this page is intentionally hidden at this moment
  if (!isShowAssistantMain) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[calc(976px+64px)] px-8 py-medium-2">
      <AssistantMain />
    </div>
  );
}
