import GeneralTabContent from "./general-tab-content";
import type { TGeneralTabGroupContentProps } from "./types";

export default function GeneralTabGroupContent(
  props: TGeneralTabGroupContentProps
) {
  const { title, description, items } = props;

  return (
    <div className="gap-v1-structural-section-compact rounded-v1-xl thickness-thin border-v1-border-structural-default p-v1-structural-content-relaxed flex flex-col">
      {title && (
        <div className="flex flex-col">
          <h2 className="typo-v1-markdown-h2 text-v1-text-hierarchy-primary line-clamp-2">
            {title}
          </h2>
          {description && (
            <p className="text-v1-text-hierarchy-secondary typo-v1-caption-mdhelper-text line-clamp-2">
              {description}
            </p>
          )}
        </div>
      )}
      {items.map((item) => (
        <GeneralTabContent key={item.title} {...item} />
      ))}
    </div>
  );
}
