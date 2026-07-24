interface BadgeLinkNode {
  type: "badgeLink";
  label: string;
  url: string;
}

declare module "mdast" {
  interface StaticPhrasingContentMap {
    badgeLink: BadgeLinkNode;
  }
}
