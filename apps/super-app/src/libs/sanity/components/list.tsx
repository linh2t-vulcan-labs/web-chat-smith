import type {
  PortableTextListComponent,
  PortableTextListItemComponent,
} from "@portabletext/react";

/**
 * Bullet list component
 */
export const BulletList: PortableTextListComponent = ({ children }) => (
  <ul className="ms-6 mb-4 list-disc">{children}</ul>
);

/**
 * Numbered list component
 */
export const NumberList: PortableTextListComponent = ({ children }) => (
  <ol className="ms-6 mb-4 list-decimal">{children}</ol>
);

/**
 * List item component
 */
export const ListItem: PortableTextListItemComponent = ({ children }) => (
  <li className="mb-1 last:mb-0">{children}</li>
);
