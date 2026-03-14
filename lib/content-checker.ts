export interface ContentIssue {
  type: "spelling" | "grammar" | "style";
  severity: "warning" | "error";
  message: string;
  suggestion?: string;
  context: string;
}

// Common typos dictionary
const COMMON_TYPOS: Record<string, string> = {
  teh: "the",
  recieve: "receive",
  definately: "definitely",
  seperate: "separate",
  occured: "occurred",
  accomodate: "accommodate",
  acheive: "achieve",
  adress: "address",
  begining: "beginning",
  beleive: "believe",
  calender: "calendar",
  collegue: "colleague",
  concious: "conscious",
  enviroment: "environment",
  existance: "existence",
  foriegn: "foreign",
  goverment: "government",
  gaurd: "guard",
  happend: "happened",
  independant: "independent",
  knowlege: "knowledge",
  liason: "liaison",
  maintainance: "maintenance",
  neccessary: "necessary",
  occurence: "occurrence",
  parliment: "parliament",
  priviledge: "privilege",
  recomend: "recommend",
  relevent: "relevant",
  succesful: "successful",
  thier: "their",
  untill: "until",
  wierd: "weird",
};

function getContext(text: string, index: number, length: number = 40): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length + 20);
  let ctx = text.slice(start, end).trim();
  if (start > 0) ctx = "..." + ctx;
  if (end < text.length) ctx = ctx + "...";
  return ctx;
}

export function checkContent(text: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (!text || text.trim().length === 0) return issues;

  // 1. Missing capitalization after sentence-ending punctuation
  const capRegex = /[.!?]\s+([a-z])/g;
  let match: RegExpExecArray | null;
  while ((match = capRegex.exec(text)) !== null) {
    issues.push({
      type: "grammar",
      severity: "warning",
      message: `Sentence should start with a capital letter: "${match[1]}"`,
      suggestion: match[1].toUpperCase(),
      context: getContext(text, match.index),
    });
  }

  // 2. Double spaces
  const doubleSpaceRegex = /  +/g;
  while ((match = doubleSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "grammar",
      severity: "warning",
      message: "Double space detected",
      suggestion: " ",
      context: getContext(text, match.index),
    });
  }

  // 3. Common typos
  for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
    const typoRegex = new RegExp(`\\b${typo}\\b`, "gi");
    while ((match = typoRegex.exec(text)) !== null) {
      issues.push({
        type: "spelling",
        severity: "error",
        message: `Possible misspelling: "${match[0]}"`,
        suggestion: correction,
        context: getContext(text, match.index),
      });
    }
  }

  // 4. Long sentences (>40 words)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 40) {
      issues.push({
        type: "style",
        severity: "warning",
        message: `Long sentence (${words.length} words). Consider breaking it up.`,
        context: sentence.trim().slice(0, 60) + "...",
      });
    }
  }

  // 5. Passive voice indicators
  const passiveRegex =
    /\b(was|were|is|are|been|being)\s+([\w]+(?:ed|en|t))\b/gi;
  while ((match = passiveRegex.exec(text)) !== null) {
    issues.push({
      type: "style",
      severity: "warning",
      message: `Possible passive voice: "${match[0]}"`,
      suggestion: "Consider using active voice",
      context: getContext(text, match.index),
    });
  }

  // 6. Repeated words
  const repeatedRegex = /\b(\w{3,})\s+\1\b/gi;
  while ((match = repeatedRegex.exec(text)) !== null) {
    issues.push({
      type: "grammar",
      severity: "error",
      message: `Repeated word: "${match[1]}"`,
      suggestion: match[1],
      context: getContext(text, match.index),
    });
  }

  return issues;
}
