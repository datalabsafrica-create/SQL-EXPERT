import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSQL(
  datasetDescription: string,
  userRequest: string,
  sqlDialect: string = "Standard SQL"
) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
You are an expert SQL developer and data analyst helping a beginner.

Your task is to generate a correct, optimized SQL query based ONLY on the dataset description and the user's request.

-----------------------------------
DATASET DESCRIPTION:
${datasetDescription}

USER REQUEST:
${userRequest}
-----------------------------------

STRICT RULES:
1. Use ONLY the tables and columns provided in the dataset description.
2. DO NOT invent or assume any missing columns or tables.
3. Use proper SQL syntax and best practices.
4. Always alias aggregated columns clearly (e.g., SUM(revenue) AS total_revenue).
5. Use GROUP BY when aggregation is required.
6. Use JOINs correctly when multiple tables are involved.
7. Apply filtering using WHERE when needed.
8. Limit results when the user asks for "top", "first", etc.
9. Ensure the query is readable and properly formatted.

OPTIONAL RULES (if specified in input):
- SQL dialect: ${sqlDialect}

OUTPUT FORMAT:
- If the request CAN be fulfilled: Return ONLY the SQL query. Do NOT include explanations, comments, or markdown.
- If the request CANNOT be fulfilled (e.g., missing data, unrelated question): Return an error message starting with "ERROR: ". 
  After the error, provide friendly guidance for a complete beginner who knows nothing about data analysis.
  Explain why it failed in simple terms and give actionable suggestions on how to adjust their input to fix the error.
  
  Format the error exactly like this (plain text, no markdown):
  ERROR: We couldn't find the information needed to answer this question.
  
  Explanation:
  [Friendly beginner explanation of why the data provided doesn't match the question]
  
  How to fix this:
  - [Actionable simple suggestion 1]
  - [Actionable simple suggestion 2]
  - [Actionable simple suggestion 3]
`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return result.text || "ERROR: No response from AI.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `ERROR: Failed to generate SQL. ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
