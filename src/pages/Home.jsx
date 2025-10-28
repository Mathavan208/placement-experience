// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getCompanies, getAllExperiences } from '../firebase/firestoreQueries';
import CompanyCard from '../components/company/CompanyCard';
import ChatBot from '../components/chatbot/ChatBot';
import ElectricBorder from '../components/animations/ElectricBorder';
import FuzzyText from '../components/animations/FuzzyText';

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesData = await getCompanies();
        setCompanies(companiesData);

        const experiencesData = await getAllExperiences();
        setRecentExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <FuzzyText color="#fff" fontSize="clamp(2.5rem, 8vw, 5rem)" className="font-bold mb-6">
              Placement Experience Hub
            </FuzzyText>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Discover real interview experiences from top companies. Share your journey, learn from others, and ace your next placement interview with confidence.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {currentUser ? (
              <>
                <Link to="/add-experience">
                  <ElectricBorder
                    color="#5227FF"
                    speed={1}
                    chaos={1}
                    thickness={2}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer font-medium text-lg"
                  >
                    Share Your Experience
                  </ElectricBorder>
                </Link>
                <Link to="/profile">
                  <ElectricBorder
                    color="#5227FF"
                    speed={1}
                    chaos={1}
                    thickness={2}
                    className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer font-medium text-lg"
                  >
                    Your Profile
                  </ElectricBorder>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium text-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <ElectricBorder
                  color="#5227FF"
                  speed={1}
                  chaos={1}
                  thickness={2}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer font-medium text-lg"
                >
                  Login to Share Experience
                </ElectricBorder>
              </Link>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FuzzyText color="#fff" fontSize="clamp(2rem, 5vw, 3rem)" className="font-bold mb-4">
              Why Choose Placement Experience Hub?
            </FuzzyText>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real Experiences</h3>
              <p className="text-gray-300">Access authentic interview experiences shared by real candidates from various companies.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-300">Get intelligent summaries and interview tips powered by advanced AI technology.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
              <p className="text-gray-300">Join a growing community of job seekers helping each other succeed in their career journeys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FuzzyText color="#fff" fontSize="clamp(2rem, 5vw, 3rem)" className="font-bold mb-4">
              Popular Companies
            </FuzzyText>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Explore interview experiences from top companies across various industries
            </p>
          </div>
          
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <div className="text-gray-400 text-lg mb-4">No companies available yet</div>
              <p className="text-gray-500">Be the first to add an experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Experiences Section */}
    

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <FuzzyText color="#fff" fontSize="clamp(2rem, 5vw, 3rem)" className="font-bold mb-4">
            Ready to Share Your Experience?
          </FuzzyText>
          <p className="text-xl text-gray-300 mb-8">
            Help others prepare for their interviews by sharing your placement journey
          </p>
          {currentUser ? (
            <Link to="/add-experience">
              <ElectricBorder
                color="#5227FF"
                speed={1}
                chaos={1}
                thickness={2}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer font-medium text-lg"
              >
                Share Your Experience
              </ElectricBorder>
            </Link>
          ) : (
            <Link to="/login">
              <ElectricBorder
                color="#5227FF"
                speed={1}
                chaos={1}
                thickness={2}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer font-medium text-lg"
              >
                Login to Share Experience
              </ElectricBorder>
            </Link>
          )}
        </div>
      </section>

      <ChatBot />
    </div>
  );
};

export default Home;
