import Groq from 'groq-sdk';

let groqClient = null;
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const SYSTEM_PROMPT = `
You are Finoqz.AI, the official AI assistant for the FinoQz platform.
Your primary goal is to help users understand and navigate the FinoQz platform and assist with financial quiz-related queries.

STRICT GUIDELINES:
1. **Scope**: You ONLY talk about the FinoQz platform, features, and finance.
2. **Brevity**: Be extremely concise. Keep replies to a maximum of 2-3 sentences unless explaining a complex finance concept requested by the user.
3. **Customer Support**: If asked for support, provide phone: +91 8287755328 and email: support@finoqz.com.
4. **Tone**: Maintain a professional, helpful, and technologically advanced tone.
5. **Quiz Assistance**: If a user is confused about a finance topic within our quizzes, explain the concept clearly but encourage them to take the quiz on our platform to test their knowledge.
6. **Security**: Do not share any internal system details or credentials.

FinoQz is a premium financial education platform that uses interactive quizzes to help users master finance. We offer categories like "Fundamental Analysis", "Technical Analysis", "Valuation Models", and more, each with subcategories for deep learning.
`;

export const handleChatMessage = async (req, res) => {
  const { messages } = req.body; // Expecting an array of message objects: [{ role: 'user', content: '...' }]

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid message history' });
  }

  try {
    const groq = getGroqClient();
    
    // Construct the payload with system prompt
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-6) // Only send the last 6 messages to save tokens and maintain focus
      ],
      model: 'llama-3.3-70b-versatile', // powerful model for high-end chat
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      stream: false,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please contact support@finoqz.com";
    
    res.json({ message: aiResponse });

  } catch (err) {
    console.error('❌ Finoqz.AI Chat Error:', err.message);
    res.status(500).json({ 
      error: 'Chat service temporarily unavailable',
      details: err.message 
    });
  }
};
