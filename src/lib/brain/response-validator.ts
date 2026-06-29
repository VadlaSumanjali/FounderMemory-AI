/**
 * Interface representing a validation result.
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedContent: string;
  issues: string[];
}

/**
 * Validates and sanitizes the AI-generated response before showing it to the founder.
 */
export function validateResponse(content: string): ValidationResult {
  const issues: string[] = [];
  let sanitizedContent = content;

  // 1. Check for common placeholders
  const placeholderRegex = /\[Insert [^\]]+\]|TODO:|lorem ipsum|\[your [^\]]+\]/gi;
  if (placeholderRegex.test(content)) {
    issues.push("Response contains unfinished placeholders or TODO comments.");
    // Replace placeholders with a cleaner indication
    sanitizedContent = sanitizedContent.replace(placeholderRegex, "(details to be finalized)");
  }

  // 2. Validate empty content
  if (!content || content.trim().length === 0) {
    issues.push("Response content is empty.");
    sanitizedContent = "I apologize, but I could not formulate a response based on the active memory graph.";
  }

  // 3. Check for malformed markdown tables
  const unclosedPipeMatches = (content.match(/\|/g) || []).length;
  if (unclosedPipeMatches > 0 && unclosedPipeMatches % 2 !== 0) {
    issues.push("Detected potentially malformed markdown table rows.");
  }

  return {
    isValid: issues.length === 0,
    sanitizedContent,
    issues,
  };
}
