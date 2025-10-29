import React, { useState, useRef, useEffect } from 'react';
import { answerQuestion } from '../../api/geminiService';
import { 
  getAllExperiences, 
  getCompanies, 
  getExperiencesByUserId, 
  getUserProfile 
} from '../../firebase/firestoreQueries';

import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you find placement experiences, companies, or answer questions based on your profile. Ask me anything!' }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [allExperiences, setAllExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [userExperiences, setUserExperiences] = useState([]);
  const [userProfile, setUserProfileState] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const exp = await getAllExperiences();
      const comp = await getCompanies();

      setAllExperiences(exp);
      setCompanies(comp);

      if (user) {
        const userExp = await getExperiencesByUserId(user.uid);
        const profile = await getUserProfile(user.uid);
        setUserExperiences(userExp);
        setUserProfileState(profile);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const botReply = await answerQuestion(input, {
        companies,
        allExperiences,
        userProfile,
        userExperiences
      });

      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);

    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    }

    setIsLoading(false);
  };

  const onKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {isOpen ? (
        <div className="flex flex-col bg-gray-800 rounded-lg shadow-xl w-80 h-96 bg-opacity-90 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <FuzzyText color="#fff" fontSize="1.2rem">Placement Assistant</FuzzyText>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 transition-colors hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-gray-300 animate-pulse">Thinking...</div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <div className="flex items-center p-3 space-x-2 border-t border-gray-700">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={onKeyPress}
              className="flex-1 px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none"
            />
            <button onClick={sendMessage} disabled={isLoading} className="px-3 py-2 text-white bg-blue-600 rounded-lg">
              Send
            </button>
          </div>
        </div>
      ) : (
       <div
  onClick={() => setIsOpen(true)}
  className="flex items-center justify-center cursor-pointer w-14 h-14"
>
  <ElectricBorder
    color="#5227FF"
    speed={1}
    chaos={1}
    thickness={2}
    className="flex items-center justify-center w-full h-full bg-gray-800 rounded-full bg-opacity-90 backdrop-blur-md"
  >
    💬
  </ElectricBorder>
</div>

      )}
    </div>
  );
};

export default ChatBot;
