"use server";

import htmlToDocx from "html-to-docx";
import { marked } from "marked";

export async function exportHtmlToDocx(
  content: string
): Promise<ArrayBuffer | null> {
  try {
    const html = await marked(content, {
      breaks: true,
      gfm: true,
    });

    const docxBuffer = (await htmlToDocx(html, null, {
      footer: true,
      pageNumber: true,
      table: { row: { cantSplit: true } },
    })) as ArrayBuffer;

    return docxBuffer;
  } catch (error) {
    console.log({ error });
    return null;
  }
}
