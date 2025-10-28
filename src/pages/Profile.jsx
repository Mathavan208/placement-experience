// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getExperiencesByUserId } from '../firebase/firestoreQueries';
import { Navigate, Link } from 'react-router-dom';
import ElectricBorder from '../components/animations/ElectricBorder';
import FuzzyText from '../components/animations/FuzzyText';

const Profile = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [userExperiences, setUserExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experiences');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        // Get experiences by user ID
        const experiences = await getExperiencesByUserId(currentUser.uid);
        setUserExperiences(experiences);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      case 'hard': return 'bg-red-900/50 text-red-300 border-red-700/50';
      default: return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    }
  };

  const getOfferStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'rejected': return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      default: return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <FuzzyText color="#fff" fontSize="2rem" className="font-semibold mb-1">
                  {userProfile?.displayName || 'User'}
                </FuzzyText>
                <p className="text-gray-400">{currentUser.email}</p>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate ? userProfile.createdAt.toDate() : userProfile.createdAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/add-experience">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                  Add Experience
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      
        {/* Tab Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6">
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'experiences'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('experiences')}
              >
                Your Experiences
              </button>
            
            </nav>
          </div>

          {activeTab === 'experiences' && (
            <div>
              {userExperiences.length > 0 ? (
                <div className="space-y-6">
                  {userExperiences.map((experience) => (
                    <ElectricBorder
                      key={experience.id}
                      color="#5227FF"
                      speed={1}
                      chaos={1}
                      thickness={2}
                      className="p-6 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{experience.position}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {experience.companyName}
                            </span>
                            <span>•</span>
                            <span>{formatDate(experience.interviewDate)}</span>
                          </div>
                          <p className="text-gray-300 line-clamp-3">{experience.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {experience.difficulty && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(experience.difficulty)}`}>
                              {experience.difficulty}
                            </span>
                          )}
                          {experience.offerStatus && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOfferStatusColor(experience.offerStatus)}`}>
                              {experience.offerStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {experience.rounds && experience.rounds.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Interview Rounds:</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.rounds.map((round, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-600/50 text-gray-200 text-xs rounded-full">
                                {round}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {experience.tips && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Tips:</h4>
                          <p className="text-gray-300 text-sm">{experience.tips}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm text-gray-400 pt-3 border-t border-gray-700">
                        <div className="flex flex-wrap gap-4">
                          {experience.location && (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {experience.location}
                            </span>
                          )}
                          {experience.salary && (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {experience.salary}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {experience.views || 0}
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {experience.upvotes || 0}
                          </span>
                        </div>
                      </div>
                    </ElectricBorder>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-lg mb-4">You haven't shared any experiences yet</div>
                  <p className="text-gray-500 mb-6">Share your interview experiences to help others in their job search journey</p>
                  <Link to="/add-experience">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                      Share Your First Experience
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

         
        </div>
      </div>
    </div>
  );
};

export default Profile;