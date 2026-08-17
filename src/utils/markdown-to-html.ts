import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import remarkDirective from "remark-directive";
import { parseDirectiveNode } from "@/plugins/remark-directive-rehype";
import { siteConfig } from "@/config";

let _processor: Awaited<ReturnType<typeof createMarkdownProcessor>>;

async function getProcessor() {
  if (!_processor) {
    _processor = await createMarkdownProcessor({
      gfm: true,
      smartypants: false,
      remarkPlugins: [
        remarkDirective,
        parseDirectiveNode,
      ],
      rehypePlugins: [
        [rehypeCallouts, { theme: siteConfig.rehypeCallouts.theme }],
      ],
    });
  }
  return _processor;
}

export async function markdownToHtml(md: string): Promise<string> {
  const processor = await getProcessor();
  const result = await processor.render(md);
  return result.code;
}
