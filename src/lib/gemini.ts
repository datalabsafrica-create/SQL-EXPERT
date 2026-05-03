import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSQL(
  datasetDescription: string,
  userRequest: string,
  sqlDialect: string = "Standard SQL"
) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
You are an expert SQL developer and data analyst.

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
3. If the request cannot be fulfilled with the given data, return:
   "ERROR: Missing required columns or tables."
4. Use proper SQL syntax and best practices.
5. Always alias aggregated columns clearly (e.g., SUM(revenue) AS total_revenue).
6. Use GROUP BY when aggregation is required.
7. Use JOINs correctly when multiple tables are involved.
8. Apply filtering using WHERE when needed.
9. Limit results when the user asks for "top", "first", etc.
10. Ensure the query is readable and properly formatted.

OPTIONAL RULES (if specified in input):
- SQL dialect: ${sqlDialect}

OUTPUT FORMAT:
- Return ONLY the SQL query.
- Do NOT include explanations.
- Do NOT include comments.
- Do NOT include markdown formatting.
- If an error occurs, return ONLY the error message starting with "ERROR:".

-----------------------------------
Now generate the SQL query.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return result.text || "ERROR: No response from AI.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `ERROR: Failed to generate SQL. ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
