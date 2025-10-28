// api/geminiService.js

// Replace this with your actual API key
const GEMINI_API_KEY = 'AIzaSyDOkFH82fAFEzG9inBVHpPoYaoBBtO3nT0';
const API_KEY = 'AIzaSyDOkFH82fAFEzG9inBVHpPoYaoBBtO3nT0';

// Updated API URL to match the correct endpoint format
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const generateCompanySummary = async (experiences) => {
  try {
    if (!experiences || experiences.length === 0) {
      throw new Error("No experiences provided for summary generation");
    }

    const prompt = `Based on the following placement experiences, provide a comprehensive summary of the interview process, rounds, and tips for candidates. Format your response with clear sections:
    
    1. Overall Interview Process
    2. Common Interview Rounds
    3. Key Preparation Tips
    4. Difficulty Level
    5. Salary Range
    6. Final Recommendations
    
    ${experiences.map(exp => `
      Company: ${exp.companyName}
      Position: ${exp.position}
      Experience: ${exp.description}
      Rounds: ${exp.rounds ? exp.rounds.join(', ') : 'Not specified'}
      Tips: ${exp.tips || 'Not provided'}
      Difficulty: ${exp.difficulty || 'Not specified'}
      Salary: ${exp.salary || 'Not specified'}
      Offer Status: ${exp.offerStatus || 'Not specified'}
    `).join('\n\n')}`;
    
    console.log("Sending request to Gemini API");
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log("Gemini API response:", data);
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const answerQuestion = async (question, experiences) => {
  try {
    if (!experiences || experiences.length === 0) {
      return "I don't have any experiences to answer your question.";
    }

    const prompt = `Based on the following placement experiences, answer this question: "${question}"
    
    ${experiences.map(exp => `
      Company: ${exp.companyName}
      Position: ${exp.position}
      Experience: ${exp.description}
      Rounds: ${exp.rounds ? exp.rounds.join(', ') : 'Not specified'}
      Tips: ${exp.tips || 'Not provided'}
      Difficulty: ${exp.difficulty || 'Not specified'}
      Salary: ${exp.salary || 'Not specified'}
      Offer Status: ${exp.offerStatus || 'Not specified'}
    `).join('\n\n')}`;
    
    console.log("Sending question to Gemini API");
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return "I apologize, but I cannot answer this question at the moment.";
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return "I apologize, but I cannot answer this question at the moment.";
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error answering question:', error);
    return "I apologize, but I cannot answer this question at the moment.";
  }
};