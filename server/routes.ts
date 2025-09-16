import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

interface CodeResponse {
  success: boolean;
  code?: string;
  explanation?: string;
  suggestions?: string[];
  error?: string;
}

/**
 * Safely parses JSON from model output, even if extra text/noise is included
 */
function safeJSONParse<T = any>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

/**
 * Unified function to call OpenAI with given prompt
 */
async function callOpenAI(prompt: string): Promise<CodeResponse> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000,
      temperature: 0.2,
    });

    const rawOutput = completion.choices[0].message?.content ?? "";
    const parsed = safeJSONParse<CodeResponse>(rawOutput);

    if (!parsed) {
      return { success: false, error: "Failed to parse model output", };
    }

    return parsed;
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Generate new code based on user instructions
 */
export async function generateCode(prompt: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a professional code generator. 
    Generate clean, production-ready code. 
    Respond strictly in this JSON format:
    {
      "success": true,
      "code": "...code here...",
      "explanation": "Explain how this code works."
    }
    User request: ${prompt}`
  );
}

/**
 * Suggest improvements to existing code
 */
export async function suggestImprovements(code: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a senior code reviewer. 
    Suggest clear improvements to the given code.
    Respond strictly in this JSON format:
    {
      "success": true,
      "suggestions": ["...", "..."],
      "explanation": "Summarize why these changes matter."
    }
    Code:\n${code}`
  );
}

/**
 * Fix errors in code and explain the fix
 */
export async function fixCodeError(code: string, error: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a debugging expert. 
    Fix the error in the given code and explain the fix.
    Respond strictly in this JSON format:
    {
      "success": true,
      "code": "...corrected code...",
      "explanation": "Explain what was wrong and how it was fixed."
    }
    Code:\n${code}
    Error:\n${error}`
  );
}
