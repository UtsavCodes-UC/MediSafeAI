require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

const generateAIExplanation = async (interaction, user) => {
  try {
    const prompt = `
You are a medical assistant.

Explain this drug interaction in 5 simple bullet points.

Drug A: ${interaction.itemA}
Drug B: ${interaction.itemB}
Severity: ${interaction.severity}
Effects: ${interaction.effects.join(", ")}
Mechanism: ${interaction.mechanism}

User:
Age: ${user.age}
Conditions: ${user.conditions.join(", ")}

Rules:
- Keep it simple but detailed
- Do NOT hallucinate
- Only use given data
- Output ONLY bullet points
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const bullets = text
      .split("\n")
      .map(line => line.replace(/^[-•]\s*/, "").trim())
      .filter(line => line.length > 0);

    return bullets;

  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Unable to generate explanation at the moment."];
  }
};

module.exports = generateAIExplanation;