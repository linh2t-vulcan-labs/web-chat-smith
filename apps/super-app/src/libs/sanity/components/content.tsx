import type {
  PortableTextComponents,
  PortableTextMarkComponentProps,
} from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import React from "react";

import { BlockComponent } from "./block";
import { BulletList, ListItem, NumberList } from "./list";
import type { ContentSection, SanityBlock, SanityLinkValue } from "./types";
import { isHeading } from "./utils";

interface GroupedPortableTextProps {
  value: SanityBlock[];
}

/**
 * Group content blocks by headings for better structure
 */
const groupContentByHeadings = (blocks: SanityBlock[]): ContentSection[] => {
  const sections: ContentSection[] = [];
  let currentSection: ContentSection | null = null;

  for (const [index, block] of blocks.entries()) {
    if (isHeading(block)) {
      // Save current section if it exists
      if (currentSection) {
        sections.push(currentSection);
      }

      // Create new section with heading
      currentSection = {
        content: [],
        heading: block,
        id: `section-${index}`,
      };
    } else {
      // Create default section if none exists
      currentSection ??= {
        content: [],
        heading: null,
        id: "section-intro",
      };
      currentSection.content.push(block);
    }
  }

  // Add final section if it exists
  if (
    currentSection &&
    (currentSection.heading || currentSection.content.length > 0)
  ) {
    sections.push(currentSection);
  }

  return sections;
};

interface ContentSectionComponentProps {
  section: ContentSection;
  components: PortableTextComponents;
}

/**
 * Render a single content section with optional heading
 */
const ContentSectionComponent: React.FC<ContentSectionComponentProps> = ({
  section,
  components,
}) => {
  const sectionId =
    section.heading?._key ||
    section.heading?.children?.[0]?.text
      ?.toLowerCase()
      .replaceAll(/\s+/gu, "-") ||
    section.id;

  // If only heading exists without content
  if (section.content.length === 0 && section.heading) {
    return <PortableText value={[section.heading]} components={components} />;
  }

  return (
    <div id={sectionId}>
      {section.heading && (
        <PortableText value={[section.heading]} components={components} />
      )}
      {section.content.length > 0 && (
        <div className="section-content">
          <PortableText value={section.content} components={components} />
        </div>
      )}
    </div>
  );
};

/**
 * Default Portable Text components with styling
 */
const createDefaultComponents = (): PortableTextComponents => ({
  block: BlockComponent as unknown as PortableTextComponents["block"],
  list: {
    bullet: BulletList,
    number: NumberList,
  },
  listItem: {
    bullet: ListItem,
    number: ListItem,
  },
  marks: {
    code: ({ children }: { children: React.ReactNode }) => (
      <code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    ),
    em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
    link: ({
      children,
      value,
    }: PortableTextMarkComponentProps<SanityLinkValue>) => (
      <a
        href={value?.href || "#"}
        className="text-content-bodyM-highlight text-text-general-brand-identity w-fit underline"
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    "strike-through": ({ children }: { children: React.ReactNode }) => (
      <s>{children}</s>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong>{children}</strong>
    ),
    underline: ({ children }: { children: React.ReactNode }) => (
      <u>{children}</u>
    ),
  },
});

/**
 * Main component to render grouped Portable Text content with alignment support
 */
export const GroupedPortableText: React.FC<GroupedPortableTextProps> = ({
  value,
}) => {
  if (!value || !Array.isArray(value)) {
    return null;
  }

  const sections = groupContentByHeadings(value);
  const defaultComponents = createDefaultComponents();

  return (
    <div className="grouped-portable-text">
      {sections.map((section, index) => (
        <ContentSectionComponent
          key={section.id || index}
          section={section}
          components={defaultComponents}
        />
      ))}
    </div>
  );
};

export default GroupedPortableText;
