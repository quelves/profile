const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(process.cwd(), "content", "journal");
const outputFile = path.join(process.cwd(), "content", "posts.json");

if (!fs.existsSync(postsDir)) {
  fs.writeFileSync(outputFile, "[]");
  process.exit(0);
}

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

const posts = files.map((fileName) => {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDir, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    category: data.category || "General",
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    content,
    readingTime,
    lang: data.lang || "es",
  };
});

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated posts.json with ${posts.length} posts`);
