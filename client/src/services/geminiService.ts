export const generateResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I had a thought, but it slipped away. Can you ask again?";
  } catch (error) {
    console.error("Gemini API Error (Backend):", error);
    return "I'm having trouble processing that right now. I might be overwhelmed with requests!";
  }
};

// Deprecated: No longer needed on frontend
export const initializeGenAI = () => {
  console.log("GenAI now initialized on backend.");
};