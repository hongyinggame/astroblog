import { createMarkdownProcessor } from "@astrojs/markdown-remark";

let _processor: Awaited<ReturnType<typeof createMarkdownProcessor>>;

async function getProcessor() {
  if (!_processor) {
    _processor = await createMarkdownProcessor({ gfm: true, smartypants: false });
  }
  return _processor;
}

export async function markdownToHtml(md: string): Promise<string> {
  const processor = await getProcessor();
  const result = await processor.render(md);
  return result.code;
}
