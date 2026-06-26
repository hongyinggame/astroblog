/* Create new post / chatter / essay markdown file with front-matter */

import fs from "fs"
import path from "path"

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDateTime() {
  const now = new Date()
  const date = getDate()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${date} ${hours}:${minutes}:${seconds}`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`用法:
  pnpm new-post <文件名>                    创建文章 (posts)
  pnpm new-post <文件名> --type chatter     创建说说 (chatters)
  pnpm new-post <文件名> --type essay       创建杂谈 (essays)`)
  process.exit(1)
}

let fileName = args[0]
const typeIndex = args.indexOf("--type")
let type = "post"
if (typeIndex !== -1 && args[typeIndex + 1]) {
  type = args[typeIndex + 1]
}

const typeConfig = {
  post: {
    dir: "./src/content/posts/",
    label: "文章",
    template: (title) => `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
`,
  },
  chatter: {
    dir: "./src/content/chatters/",
    label: "说说",
    template: (title) => `---
title: ${title}
published: ${getDateTime()}
description: ''
tags: [日常]
pinned: false
---
`,
  },
  essay: {
    dir: "./src/content/essays/",
    label: "杂谈",
    template: (title) => `---
title: ${title}
published: ${getDate()}
description: ''
tags: []
---
`,
  },
}

const config = typeConfig[type]
if (!config) {
  console.error(`Error: 未知类型 "${type}"，可选: post, chatter, essay`)
  process.exit(1)
}

// Add .md extension if not present
const fileExtensionRegex = /\.(md|mdx)$/i
if (!fileExtensionRegex.test(fileName)) {
  fileName += ".md"
}

const fullPath = path.join(config.dir, fileName)

if (fs.existsSync(fullPath)) {
  console.error(`Error: 文件 ${fullPath} 已存在`)
  process.exit(1)
}

const dirPath = path.dirname(fullPath)
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true })
}

const content = config.template(fileName.replace(/\.(md|mdx)$/i, ""))
fs.writeFileSync(fullPath, content)

console.log(`✅ ${config.label}已创建: ${fullPath}`)
