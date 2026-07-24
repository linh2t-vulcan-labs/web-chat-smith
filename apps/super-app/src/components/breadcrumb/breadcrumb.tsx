"use client";

import React from "react";

import { Link, usePathname } from "@/i18n/navigation";
import {
  capitalizeFirstLetter,
  getNameFromSlug,
} from "@/utils/commons/helpers";
import { getBreadcrumbTitle } from "@/utils/mappers/breadcrumb";

import type { TBreadCrumbProps } from "./types";

export default function Breadcrumb({
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
  firstSegmentLabelMap,
  segmentLabelMap,
}: Readonly<TBreadCrumbProps>) {
  const paths = usePathname();
  const pathNames = paths.split("/").filter(Boolean);

  return (
    <ul className={containerClasses}>
      {pathNames.map((link, index) => {
        const isFirst = index === 0;
        const href = `/${pathNames.slice(0, index + 1).join("/")}`;
        const itemClasses =
          paths === href ? `${listClasses} ${activeClasses}` : listClasses;
        const formatLink = getNameFromSlug(link);

        let itemLink: string;
        const mapped = segmentLabelMap?.[link];
        if (mapped === null || mapped === undefined) {
          itemLink = capitalizeLinks
            ? capitalizeFirstLetter(formatLink)
            : formatLink;

          if (isFirst) {
            itemLink =
              firstSegmentLabelMap?.[formatLink] ||
              getBreadcrumbTitle(formatLink) ||
              itemLink.toUpperCase();
          }
        } else {
          itemLink = mapped;
        }

        return (
          <React.Fragment key={index}>
            <li className={itemClasses}>
              <Link href={href}>{itemLink}</Link>
            </li>
            {pathNames.length !== index + 1 && separator}
          </React.Fragment>
        );
      })}
    </ul>
  );
}
