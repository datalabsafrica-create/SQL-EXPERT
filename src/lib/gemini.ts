// By commenting out the GoogleGenAI initialization, we remove the API requirement.
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSQL(
  datasetDescription: string,
  userRequest: string,
  sqlDialect: string = "Standard SQL"
) {
  // Simulate AI generation delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Extract a table name from the prompt to make the mock slightly contextual
  const tableMatch = datasetDescription.match(/([a-zA-Z0-9_]+)\s*\(/);
  const mainTable = tableMatch ? tableMatch[1] : "target_table";

  // Simple heuristic to guess an aggregate vs select (*)
  const isAggregate = userRequest.toLowerCase().includes("total") || userRequest.toLowerCase().includes("count") || userRequest.toLowerCase().includes("sum");

  let mockQuery = "";

  if (isAggregate) {
    mockQuery = `SELECT 
  category,
  COUNT(*) AS total_count
FROM ${mainTable}
GROUP BY category
ORDER BY total_count DESC
LIMIT 10;`;
  } else {
    mockQuery = `SELECT *
FROM ${mainTable}
WHERE status = 'active'
LIMIT 50;`;
  }

  return `-- [LOCAL MOCK MODE] API requirement has been removed.
-- Simulated ${sqlDialect} Query based on your request.

${mockQuery}`;
}
