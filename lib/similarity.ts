export interface SimilarityMatch {
  articleId: string;
  articleTitle: string;
  similarity: number;
  matchingSnippets: string[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateNgrams(text: string, n: number = 3): Set<string> {
  const words = normalize(text).split(" ");
  const ngrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function findMatchingSnippets(
  textA: string,
  textB: string,
  maxSnippets: number = 3
): string[] {
  const wordsA = normalize(textA).split(" ");
  const wordsB = normalize(textB).split(" ");
  const snippets: string[] = [];
  const bSet = new Set(wordsB.map((_, i) => wordsB.slice(i, i + 5).join(" ")));

  for (let i = 0; i <= wordsA.length - 5; i++) {
    const chunk = wordsA.slice(i, i + 5).join(" ");
    if (bSet.has(chunk) && !snippets.some((s) => s.includes(chunk))) {
      snippets.push(chunk);
      if (snippets.length >= maxSnippets) break;
    }
  }

  return snippets;
}

export function findSimilarArticles(
  newText: string,
  existingArticles: { id: string; title: string; text: string }[],
  threshold: number = 0.3
): SimilarityMatch[] {
  if (!newText || newText.trim().length < 50) return [];

  const newNgrams = generateNgrams(newText);
  if (newNgrams.size === 0) return [];

  const matches: SimilarityMatch[] = [];

  for (const article of existingArticles) {
    if (!article.text || article.text.trim().length < 50) continue;
    const articleNgrams = generateNgrams(article.text);
    const similarity = jaccardSimilarity(newNgrams, articleNgrams);

    if (similarity >= threshold) {
      matches.push({
        articleId: article.id,
        articleTitle: article.title,
        similarity,
        matchingSnippets: findMatchingSnippets(newText, article.text),
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
