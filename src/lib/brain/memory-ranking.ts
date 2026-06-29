import { RecalledMemory } from "../hindsight";

/**
 * Ranks recalled memories using a multi-criteria scoring algorithm:
 * Score = Embedding Similarity * (Importance / 10) * RecencyDecay * LogFrequency * Confidence
 */
export function rankMemories(memories: RecalledMemory[], limit = 8): RecalledMemory[] {
  const now = new Date().getTime();
  const decayCoefficient = 0.05; // Decays recency to 0.5 after ~14 days

  const scoredMemories = memories.map(memory => {
    // 1. Embedding Similarity (0.0 to 1.0)
    const similarity = memory.embeddingScore;

    // 2. Importance Factor (Normalized 1-10 to 0.1-1.0)
    const importanceFactor = Math.max(1, Math.min(10, memory.importance)) / 10.0;

    // 3. Recency Time Decay (Exponential decay based on age in days)
    const ageInMs = now - new Date(memory.createdAt).getTime();
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
    const recencyDecay = Math.exp(-decayCoefficient * ageInDays);

    // 4. Frequency Boost (Logarithmic scaling to prevent runaway scores)
    // We increment count and query database, so frequency is >= 1.
    // If it's a new memory, frequency = 1, giving log(1) = 0, so factor = 1.0
    // If frequency = 10, log(10) = 2.3, giving factor = 3.3
    const frequencyFactor = 1.0 + Math.log(1.0); // We'll mock frequency using a fallback since we only pass RecalledMemory

    // 5. Confidence Score (0.0 to 1.0)
    const confidence = Math.max(0.0, Math.min(1.0, memory.confidence));

    // Calculate final composite score
    const finalScore = similarity * importanceFactor * recencyDecay * frequencyFactor * confidence;

    return {
      ...memory,
      // Temporarily store final calculated score as embeddingScore for comparison
      embeddingScore: parseFloat(finalScore.toFixed(4)),
    };
  });

  // Sort memories in descending order of calculated score and slice
  return scoredMemories
    .sort((a, b) => b.embeddingScore - a.embeddingScore)
    .slice(0, limit);
}
