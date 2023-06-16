import zlib from "zlib";
import axios from "axios";
import fs from "fs";

// Function to extract sitemap of sitemaps
async function extractSitemapOfSitemaps(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  let sitemapContent;

  // Decompress gzip content
  if (response.headers["content-encoding"] === "gzip") {
    sitemapContent = zlib.gunzipSync(buffer).toString();
  } else {
    sitemapContent = buffer.toString();
  }

  // Regular expression to extract URLs from the sitemap
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  const sitemaps = [];

  // Extract URLs from the sitemap
  while ((match = urlRegex.exec(sitemapContent))) {
    const sitemapUrl = match[1];
    sitemaps.push(sitemapUrl);
  }

  return sitemaps;
}

// Main function to process the sitemap of sitemaps
async function processSitemapOfSitemaps(sitemapOfSitemapsUrl) {
  const sitemapOfSitemaps = await extractSitemapOfSitemaps(sitemapOfSitemapsUrl);
  const uniqueUrls = new Set();

  // Process each individual sitemap
  for (const sitemapUrl of sitemapOfSitemaps) {
    const sitemapUrls = await extractSitemapOfSitemaps(sitemapUrl);

    // Add URLs to the Set
    for (const url of sitemapUrls) {
      uniqueUrls.add(url);
    }
  }

  // Write unique URLs to a file
  const csvContent = Array.from(uniqueUrls).join('\n');
  fs.writeFileSync('urls.csv', csvContent);
}

// Call the main function with the URL of the sitemap of sitemaps
const sitemapOfSitemapsUrl =
  "https://www.target.com/sitemap_taxonomy-brand-index.xml.gz";
processSitemapOfSitemaps(sitemapOfSitemapsUrl);
