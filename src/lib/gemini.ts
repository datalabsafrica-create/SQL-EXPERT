import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. If you deployed to Vercel, please add it in your Vercel Project Settings under Environment Variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function generateSQL(
  datasetDescription: string,
  userRequest: string,
  sqlDialect: string = "Standard SQL"
) {
  const model = "gemini-2.5-flash";
  
  const prompt = `
You are an expert SQL developer and data analyst helping a beginner.

Your task is to generate a correct, optimized SQL query based ONLY on the dataset description and the user's request.
Ensure that the query generated matches exactly with the tables and columns provided by the user. 
Do not hallucinate columns or tables that were not provided.

DATASET DESCRIPTION:
${datasetDescription}

USER REQUEST:
${userRequest}

STRICT RULES:
1. Use ONLY the tables and columns provided in the dataset description.
2. DO NOT invent or assume any missing columns or tables.
3. Use proper SQL syntax and best practices for ${sqlDialect}.
4. Always alias aggregated columns clearly (e.g., SUM(revenue) AS total_revenue).
5. Use GROUP BY when aggregation is required.
6. Use JOINs correctly when multiple tables are involved.
7. Apply filtering using WHERE when needed.
8. Limit results when the user asks for "top", "first", etc.
9. Ensure the query is readable and properly formatted.

OUTPUT FORMAT:
Return a JSON object with EXACTLY these properties:
{
  "sql": "The raw SQL query here. If there are missing fields or tables making it impossible, return an empty string.",
  "error": "If the request CANNOT be fulfilled (e.g., missing data, unrelated question), explain why. Frame it in a friendly, beginner-friendly way with suggestions. If successful, set this to null.",
  "explanation": "If successful, provide a beginner-friendly bulleted explanation of what the SQL clauses are doing. (e.g. • **SELECT**: We ask for the category name and count all items in each.)"
}

Respond ONLY with valid JSON. No markdown fences like \`\`\`json.
`;

  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = result.text || "{}";
    const cleanedText = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    
    try {
      const parsed = JSON.parse(cleanedText);
      return {
        sql: parsed.sql || "",
        error: parsed.error || null,
        explanation: parsed.explanation || ""
      };
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return {
        sql: "",
        error: "ERROR: Failed to generate a valid response from the AI. Please try again.",
        explanation: ""
      };
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong while connecting to the AI service.";
    return {
      sql: "",
      error: `ERROR: ${errorMessage}`,
      explanation: ""
    };
  }
}

