import type { TBlog, TSanityImage } from "@/libs/sanity/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnresolvedReference(value: unknown): boolean {
  return isRecord(value) && typeof value._ref === "string" && !("_id" in value);
}

function normalizeImage(value: unknown): TSanityImage | undefined {
  if (!isRecord(value) || typeof value.url !== "string" || !value.url.trim()) {
    return undefined;
  }

  const asset = isRecord(value.asset) ? value.asset : {};

  return {
    _type: "image",
    alt: typeof value.alt === "string" ? value.alt : null,
    asset: {
      _id: typeof asset._id === "string" ? asset._id : undefined,
      _ref: typeof asset._ref === "string" ? asset._ref : "",
    },
    lqip: typeof value.lqip === "string" ? value.lqip : undefined,
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
    url: value.url,
  };
}

function normalizeCategory(value: unknown): TBlog["category"] {
  if (!(isRecord(value) && isRecord(value.slug))) {
    return null;
  }

  return {
    createdAt: "",
    description: null,
    slug: {
      current: typeof value.slug.current === "string" ? value.slug.current : "",
    },
    title: typeof value.title === "string" ? value.title : "",
  };
}

function normalizeResourceBlogRow(row: unknown): TBlog | null {
  if (!isRecord(row) || isUnresolvedReference(row)) {
    return null;
  }

  const _id = typeof row._id === "string" ? row._id : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const slugCurrent =
    isRecord(row.slug) && typeof row.slug.current === "string"
      ? row.slug.current
      : "";

  if (!_id || !title || !slugCurrent) {
    return null;
  }

  const image = normalizeImage(row.image);
  if (!image) {
    return null;
  }

  const category = normalizeCategory(row.category);
  const authorImage = normalizeImage(row.authorImage);

  return {
    _id,
    _key: typeof row._key === "string" ? row._key : _id,
    authorImage,
    authorName: typeof row.authorName === "string" ? row.authorName : undefined,
    blogId: typeof row.blogId === "number" ? row.blogId : 0,
    brief: typeof row.brief === "string" ? row.brief : "",
    category,
    content: row.content ?? null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
    image,
    language: typeof row.language === "string" ? row.language : null,
    publishedAt: typeof row.publishedAt === "string" ? row.publishedAt : "",
    slug: { current: slugCurrent },
    tags: Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    title,
  };
}

/** Maps dereferenced `aiTool.blogs[]` GROQ rows into `TBlog` documents for the resource section. */
export function normalizeResourceBlogRows(rows: unknown): TBlog[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(normalizeResourceBlogRow)
    .filter((row): row is TBlog => row !== null);
}
