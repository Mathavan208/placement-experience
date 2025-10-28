// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { 
  getExperiencesByUserId, 
  deleteExperience, 
  updateExperience,
  getUserProfile,
  updateUserProfile 
} from '../firebase/firestoreQueries';
import { Navigate, Link } from 'react-router-dom';
import ElectricBorder from '../components/animations/ElectricBorder';
import FuzzyText from '../components/animations/FuzzyText';

const Profile = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [userExperiences, setUserExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experiences');
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        // Get experiences by user ID
        const experiences = await getExperiencesByUserId(currentUser.uid);
        setUserExperiences(experiences);
        
        // Get user profile data
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setProfileData({
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            skills: profile.skills || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            portfolio: profile.portfolio || ''
          });
        }
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

  const handleEditExperience = (experience) => {
    setEditingExperience(experience);
  };

  const handleDeleteExperience = async (experienceId) => {
    if (window.confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      try {
        await deleteExperience(experienceId);
        setUserExperiences(userExperiences.filter(exp => exp.id !== experienceId));
      } catch (error) {
        console.error('Error deleting experience:', error);
        alert('Failed to delete experience. Please try again.');
      }
    }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    
    try {
      await updateExperience(editingExperience.id, editingExperience);
      setUserExperiences(userExperiences.map(exp => 
        exp.id === editingExperience.id ? editingExperience : exp
      ));
      setEditingExperience(null);
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      await updateUserProfile(currentUser.uid, profileData);
      setUserProfile(prev => ({ ...prev, ...profileData }));
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
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
                onClick={handleEditProfile}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{userExperiences.length}</div>
            <div className="text-gray-400">Experiences Shared</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {userExperiences.filter(exp => exp.offerStatus === 'Accepted').length}
            </div>
            <div className="text-gray-400">Offers Received</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {new Set(userExperiences.map(exp => exp.companyName)).size}
            </div>
            <div className="text-gray-400">Companies Applied</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6">
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'experiences'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('experiences')}
              >
                Your Experiences
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Settings
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
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-white">{experience.position}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditExperience(experience)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                title="Edit experience"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h5a2 2 0 002-2m0 0a2 2 0 00-2-2V5a2 2 0 00-2 2H6a2 2 0 00-2 2v10a2 2 0 002 2zm2-13a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1v-10z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a1 1 0 10-2 0" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteExperience(experience.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                                title="Delete experience"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 01-2.828 0l-4.244-4.244a2 2 0 00-2.828 0L4.244 4.244A2 2 0 005.172 5.172l4.244 4.244A2 2 0 008.828 0l4.244-4.244A2 2 0 0011.828 0L7.58 7.586a2 2 0 00-2.828 0L4.244 11.828A2 2 0 005.172 5.172l4.244-4.244z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7l-3 3m0 0l-3 3m3-3V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
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

          {activeTab === 'profile' && (
            <div>
              {editingProfile ? (
                <div className="bg-gray-700/30 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={profileData.displayName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                      <input
                        type="text"
                        id="skills"
                        name="skills"
                        value={profileData.skills}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        placeholder="e.g. JavaScript, React, Node.js"
                      />
                    </div>
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                      <input
                        type="text"
                        id="linkedin"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                      <input
                        type="text"
                        id="github"
                        name="github"
                        value={profileData.github}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
                      <input
                        type="text"
                        id="portfolio"
                        name="portfolio"
                        value={profileData.portfolio}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-gray-400 w-32">Display Name:</span>
                      <span className="text-white ml-4">{profileData.displayName || 'Not set'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 w-32">Email:</span>
                      <span className="text-white ml-4">{currentUser.email}</span>
                    </div>
                    {profileData.bio && (
                      <div className="flex items-start">
                        <span className="text-gray-400 w-32">Bio:</span>
                        <p className="text-white ml-4 flex-1">{profileData.bio}</p>
                      </div>
                    )}
                    {profileData.skills && (
                      <div className="flex items-start">
                        <span className="text-gray-400 w-32">Skills:</span>
                        <p className="text-white ml-4 flex-1">{profileData.skills}</p>
                      </div>
                    )}
                    {profileData.linkedin && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-32">LinkedIn:</span>
                        <a 
                          href={profileData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-4 truncate"
                        >
                          {profileData.linkedin}
                        </a>
                      </div>
                    )}
                    {profileData.github && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-32">GitHub:</span>
                        <a 
                          href={profileData.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-4 truncate"
                        >
                          {profileData.github}
                        </a>
                      </div>
                    )}
                    {profileData.portfolio && (
                      <div className="flex items-center">
                        <span className="text-gray-400 w-32">Portfolio:</span>
                        <a 
                          href={profileData.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-4 truncate"
                        >
                          {profileData.portfolio}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Experience Modal */}
      {editingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Experience</h3>
                <button
                  onClick={() => setEditingExperience(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveExperience} className="space-y-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={editingExperience.position}
                    onChange={(e) => setEditingExperience({...editingExperience, position: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={editingExperience.companyName}
                    onChange={(e) => setEditingExperience({...editingExperience, companyName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Experience Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingExperience.description}
                    onChange={(e) => setEditingExperience({...editingExperience, description: e.target.value})}
                    rows={5}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={editingExperience.difficulty}
                    onChange={(e) => setEditingExperience({...editingExperience, difficulty: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="offerStatus" className="block text-sm font-medium text-gray-300 mb-2">Offer Status</label>
                  <select
                    id="offerStatus"
                    name="offerStatus"
                    value={editingExperience.offerStatus}
                    onChange={(e) => setEditingExperience({...editingExperience, offerStatus: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  >
                    <option value="">Select status</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={editingExperience.salary}
                    onChange={(e) => setEditingExperience({...editingExperience, salary: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editingExperience.location}
                    onChange={(e) => setEditingExperience({...editingExperience, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div>
                  <label htmlFor="tips" className="block text-sm font-medium text-gray-300 mb-2">Tips for Candidates</label>
                  <textarea
                    id="tips"
                    name="tips"
                    value={editingExperience.tips}
                    onChange={(e) => setEditingExperience({...editingExperience, tips: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="Share any tips or advice for future candidates..."
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingExperience(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;