const fs = require('fs');

let file = fs.readFileSync('src/server/searchEngine.ts', 'utf-8');

const injection = `
  if (candidate.source === "BuyWise Exclusive" || candidate.source === "Verified Partner") {
    return { isRelevant: true, matchType: 'exact', confidence: 100, explanation: 'Verified database deal' };
  }
`;

file = file.replace(
  "export function evaluateCandidateRelevance(candidate: SearchResultItem, specs: ParsedQuerySpecs): RelevanceResult {",
  "export function evaluateCandidateRelevance(candidate: SearchResultItem, specs: ParsedQuerySpecs): RelevanceResult {" + injection
);

fs.writeFileSync('src/server/searchEngine.ts', file, 'utf-8');
console.log("Patched relevance logic!");
