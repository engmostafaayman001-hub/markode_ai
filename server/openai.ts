import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CodeGenerationRequest {
  description: string;
  language: string;
  framework?: string;
  features?: string[];
}

interface CodeGenerationResponse {
  files: Record<string, string>;
  description: string;
  setup_instructions: string;
}

interface FixCodeResponse {
  fixedCode: string;
  explanation: string;
}

// 🔒 دالة parsing آمنة
function safeJSONParse<T>(text: string): T {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : ({} as T);
  } catch {
    return {} as T;
  }
}

// ✨ توليد مشروع كامل
export async function generateCodeFromDescription(
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> {
  const { description, language, framework, features } = request;

  const prompt = `
You are an expert web developer. Generate a complete, production-ready project based on this description:

Description: ${description}
Language: ${language}
Framework: ${framework || "vanilla"}
Features: ${features?.join(", ") || "basic functionality"}

Requirements:
1. Generate complete file structure with all necessary files
2. Include modern, responsive design with Arabic language support (RTL)
3. Use best practices and clean, maintainable code
4. Include proper error handling and validation
5. Make it production-ready with security considerations

Respond with JSON in this format:
{
  "files": {
    "filename.ext": "file content",
    "folder/file.ext": "file content"
  },
  "description": "Brief description of what was created",
  "setup_instructions": "How to run/deploy this project"
}

Make sure all code is complete and functional. For React projects, use modern hooks and TypeScript. For styling, use Tailwind CSS with RTL support.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // released August 7, 2025
      messages: [
        {
          role: "system",
          content:
            "You are a senior full-stack developer who creates complete, production-ready applications. Always respond with valid JSON containing the file structure and code.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const raw = response.choices[0].message.content || "{}";
    return safeJSONParse<CodeGenerationResponse>(raw);
  } catch (error) {
    return {
      files: {},
      description: "Error occurred",
      setup_instructions: `Generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// ✨ اقتراح تحسين
export async function improveSuggestion(
  code: string,
  issue: string
): Promise<string> {
  const prompt = `
As an expert developer, analyze this code and provide a specific improvement suggestion for the issue described.

Code:
${code}

Issue: ${issue}

Provide a clear, actionable suggestion with example code if needed. Focus on best practices, performance, and maintainability.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // released August 7, 2025
      messages: [
        {
          role: "system",
          content:
            "You are a helpful coding assistant who provides clear, actionable advice for code improvements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Unable to provide suggestion.";
  } catch (error) {
    return `Improvement suggestion failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
}

// ✨ إصلاح الكود مع شرح
export async function fixCodeError(
  code: string,
  error: string
): Promise<FixCodeResponse> {
  const prompt = `
Fix this code error:

Code:
${code}

Error: ${error}

Provide the corrected code with explanation of what was wrong and how it was fixed.
Respond with JSON in this format:
{
  "fixed_code": "the corrected code",
  "explanation": "what was wrong and how it was fixed"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // released August 7, 2025
      messages: [
        {
          role: "system",
          content:
            "You are an expert debugger who can quickly identify and fix code errors. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    });

    const raw = response.choices[0].message.content || "{}";
    const result = safeJSONParse<any>(raw);

    return {
      fixedCode: result.fixed_code || code,
      explanation: result.explanation || "No explanation provided",
    };
  } catch (error) {
    return {
      fixedCode: code,
      explanation: `Fix attempt failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
