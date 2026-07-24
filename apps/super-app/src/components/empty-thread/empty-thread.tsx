import { useTranslations } from "next-intl";
import Image from "next/image";

export default function EmptyThread() {
  const sidebarT = useTranslations("mainLayout.sidebar");

  return (
    <div className="flex flex-col items-center gap-2 text-[#737373]">
      <Image
        src="/icons/no-thread.png"
        width={64}
        height={64}
        alt="no thread"
      />
      <p className="text-center font-bold">{sidebarT("emptyThread.title")}</p>
      <p className="text-center text-sm">
        {sidebarT("emptyThread.description")}
      </p>
    </div>
  );
}
