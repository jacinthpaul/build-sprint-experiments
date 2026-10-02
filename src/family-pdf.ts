import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
export async function downloadFamilyPdf(family: HTMLElement, insurer: string) {
 const [{ default: pdfMake }, { default: fonts }] = await Promise.all([import("pdfmake/build/pdfmake"), import("pdfmake/build/vfs_fonts")]);
 pdfMake.addVirtualFileSystem(fonts);
 const text = (selector: string) => family.querySelector(selector)?.textContent?.trim() || "";
 const content: Content[] = [{ text: "For my family", style: "title" }];
 const note = text(".personal-note");
 if (note) content.push({ text: note, fontSize: 12, margin: [0, 0, 0, 16] });
 content.push({ text: text(".family-intro"), margin: [0, 0, 0, 18] });
 const rows = Array.from(family.querySelectorAll("dl > div"), item => [
  { text: item.querySelector("dt")?.textContent || "", color: "#526578" },
  { text: item.querySelector("dd")?.textContent || "", bold: true }
 ]);
 content.push({ table: { widths: [140, "*"], body: rows }, layout: "lightHorizontalLines", margin: [0, 0, 0, 20] });
 content.push({ text: "How to start a claim", style: "heading", headlineLevel: 1 });
 Array.from(family.querySelectorAll("ol > li")).forEach((step, index) => {
  content.push({ text: `${index + 1}. ${step.querySelector("h4")?.textContent || ""}`, style: "step", headlineLevel: 2 });
  step.querySelectorAll("p").forEach(p => content.push({ text: p.textContent || "", margin: [0, 0, 0, 10] }));
 });
 content.push({ text: text(".guide-note"), color: "#526578", fontSize: 9, margin: [0, 14, 0, 10] });
 content.push({ text: "References", fontSize: 9, bold: true, margin: [0, 0, 0, 4] });
 family.querySelectorAll<HTMLAnchorElement>(".sources a").forEach(link => {
  content.push({ text: `${link.textContent}: ${link.href}`, link: link.href, color: "#234b70", fontSize: 8, margin: [0, 0, 0, 5] });
 });
 const definition: TDocumentDefinitions = {
  info: { title: `For my family - ${insurer || "Insurance policy"}` },
  pageSize: "A4", pageMargins: [42, 42, 42, 42],
  defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.2, color: "#1c3449" },
  styles: { title: { fontSize: 26, color: "#234b70", margin: [0, 0, 0, 18] }, heading: { fontSize: 16, bold: true, margin: [0, 0, 0, 14] }, step: { fontSize: 12, bold: true, margin: [0, 10, 0, 6] } },
  content,
  pageBreakBefore: (node, queries) => Boolean(node.headlineLevel && queries.getFollowingNodesOnPage().length === 0),
  footer: (currentPage, pageCount) => ({ text: `For my family  |  ${currentPage} / ${pageCount}`, alignment: "center", color: "#526578", fontSize: 8, margin: [0, 16, 0, 0] })
 };
 const safeName = (insurer || "insurance-policy").replace(/[^a-z0-9_-]/gi, "-").slice(0, 60);
 await pdfMake.createPdf(definition).download(`for-my-family-${safeName}.pdf`);
}
