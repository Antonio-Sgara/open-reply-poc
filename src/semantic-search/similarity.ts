import { SemanticEmbedding } from "./semanticTypes";

export const cosineSimilarity = (
  firstEmbedding: SemanticEmbedding,
  secondEmbedding: SemanticEmbedding
) => {
  if (
    firstEmbedding.length === 0 ||
    firstEmbedding.length !== secondEmbedding.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let firstNorm = 0;
  let secondNorm = 0;

  for (let index = 0; index < firstEmbedding.length; index += 1) {
    const firstValue = firstEmbedding[index] ?? 0;
    const secondValue = secondEmbedding[index] ?? 0;
    dotProduct += firstValue * secondValue;
    firstNorm += firstValue * firstValue;
    secondNorm += secondValue * secondValue;
  }

  if (firstNorm === 0 || secondNorm === 0) return 0;

  return dotProduct / (Math.sqrt(firstNorm) * Math.sqrt(secondNorm));
};
