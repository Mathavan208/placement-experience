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

 const prompt = `
Provide the summary in clean, well-formatted **Markdown** with:

- Clear headings (##)
- Bullet points
- Numbered lists
- Short paragraphs
- Bold highlight for key info
Based on these experiences:
    
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

export const answerQuestion = async (question, data) => {
  const { companies, allExperiences, userProfile, userExperiences } = data;

  const prompt = `
  You are a placement assistant bot.

  USER QUESTION: "${question}"

  COMPANIES AVAILABLE:
  ${companies.map(c => `- ${c.name} (${c.experienceCount} experiences)`).join('\n')}

  USER PROFILE:
  ${userProfile ? JSON.stringify(userProfile) : "User not logged in"}

  USER EXPERIENCES:
  ${userExperiences?.length ? userExperiences.map(e => e.companyName).join(", ") : "None uploaded"}

  ALL EXPERIENCES:
  ${allExperiences.map(exp => `
    Company: ${exp.companyName}
    Position: ${exp.position}
    Description: ${exp.description}
    Rounds: ${exp.rounds || "Not provided"}
    Tips: ${exp.tips || "Not provided"}
    Salary: ${exp.salary || "Not provided"}
  `).join('\n')}

  Now answer the user's question clearly and professionally.
  If the user asks:
  - about a company → give its interview pattern, tips, difficulty, salary
  - about best companies → answer using experienceCount
  - about user's status → mention profile or uploaded experiences
  `;

  try {
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
    console.log("Gemini chatbot response:", data);

    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      throw new Error("No valid response from Gemini");
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Error answering question:", error);
    return "I'm sorry, I couldn't fetch an answer right now. Please try again.";
  }
};

