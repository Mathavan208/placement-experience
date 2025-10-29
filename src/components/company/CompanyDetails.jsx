import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanyById, getExperiencesByCompanyId, getExperiencesByCompanyName, updateCompanySummary } from '../../firebase/firestoreQueries';
import { generateCompanySummary } from '../../api/geminiService';
import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';
import ReactMarkdown from "react-markdown";

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('experiences');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        const companyData = await getCompanyById(id);
        
        if (!companyData) {
          setError("Company not found");
          setIsLoading(false);
          return;
        }
        
        setCompany(companyData);
        
        // Try to get experiences by company ID
        let experiencesData = [];
        try {
          experiencesData = await getExperiencesByCompanyId(id);
          setExperiences(experiencesData);
        } catch (error) {
          console.error("Error fetching experiences by company ID:", error);
          
          // If that fails, try by company name as a fallback
          try {
            experiencesData = await getExperiencesByCompanyName(companyData.name);
            setExperiences(experiencesData);
          } catch (nameError) {
            console.error("Error fetching experiences by company name:", nameError);
            setExperiences([]);
          }
        }

        // Check if we have an existing summary
        if (companyData && companyData.summary) {
          setSummary(companyData.summary);
        } else if (experiencesData.length > 0) {
          // Generate new summary if we have experiences
          setIsGeneratingSummary(true);
          try {
            const summaryData = await generateCompanySummary(experiencesData);
            setSummary(summaryData);
            
            // Save summary to Firestore
            await updateCompanySummary(id, summaryData);
          } catch (summaryError) {
            console.error("Error generating summary:", summaryError);
            setError("Failed to generate AI summary: " + summaryError.message);
          } finally {
            setIsGeneratingSummary(false);
          }
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setError("Failed to load company details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  const regenerateSummary = async () => {
    if (experiences.length === 0) {
      setError("Cannot generate summary: No experiences available");
      return;
    }
    
    setIsGeneratingSummary(true);
    try {
      const summaryData = await generateCompanySummary(experiences);
      setSummary(summaryData);
      
      // Save summary to Firestore
      await updateCompanySummary(id, summaryData);
    } catch (summaryError) {
      console.error("Error regenerating summary:", summaryError);
      setError("Failed to regenerate AI summary: " + summaryError.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-white">Loading company details...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-white">{error || "Company not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Company Header */}
        <div className="p-6 mb-8 shadow-xl bg-gray-800/50 backdrop-blur-md rounded-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start">
            <div className="flex items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 mr-6 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <span className="text-3xl font-bold text-white">
                  {company.name.charAt(0)}
                </span>
              </div>
              <div>
                <FuzzyText color="#fff" fontSize="2rem" className="mb-2 font-semibold">{company.name}</FuzzyText>
                <p className="mb-4 text-gray-400">{company.industry || 'Technology'}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {company.headquarters || 'Multiple locations'}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Founded: {company.founded || 'N/A'}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {company.employeeCount || 'N/A'} employees
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4 sm:flex-row md:mt-0">
              <div className="flex items-center px-4 py-2 rounded-lg bg-gray-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium text-yellow-400">{company.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center px-4 py-2 rounded-lg bg-gray-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium text-blue-400">{experiences.length} experiences</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-gray-300">{company.description}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 text-center bg-gray-800/50 backdrop-blur-md rounded-xl">
            <div className="mb-2 text-3xl font-bold text-blue-400">{experiences.length}</div>
            <div className="text-gray-400">Total Experiences</div>
          </div>
          <div className="p-6 text-center bg-gray-800/50 backdrop-blur-md rounded-xl">
            <div className="mb-2 text-3xl font-bold text-green-400">
              {experiences.filter(exp => exp.offerStatus === 'Accepted').length}
            </div>
            <div className="text-gray-400">Offers Received</div>
          </div>
          <div className="p-6 text-center bg-gray-800/50 backdrop-blur-md rounded-xl">
            <div className="mb-2 text-3xl font-bold text-yellow-400">
              {experiences.length > 0 
                ? Math.round((experiences.filter(exp => exp.offerStatus === 'Accepted').length / experiences.length) * 100)
                : 0}%
            </div>
            <div className="text-gray-400">Success Rate</div>
          </div>
          <div className="p-6 text-center bg-gray-800/50 backdrop-blur-md rounded-xl">
            <div className="mb-2 text-3xl font-bold text-purple-400">
              {new Set(experiences.map(exp => exp.position)).size}
            </div>
            <div className="text-gray-400">Positions</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 shadow-xl bg-gray-800/50 backdrop-blur-md rounded-xl sm:p-8">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'experiences'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('experiences')}
              >
                Interview Experiences
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                AI Summary
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Statistics
              </button>
            </nav>
          </div>

          {activeTab === 'experiences' && (
            <div>
              {experiences.length > 0 ? (
                <div className="space-y-6">
                  {experiences.map((experience) => (
                    <ElectricBorder
                      key={experience.id}
                      color="#5227FF"
                      speed={1}
                      chaos={1}
                      thickness={2}
                      className="p-6 transition-all duration-300 rounded-lg bg-gray-700/30 hover:bg-gray-700/50"
                    >
                      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:justify-between lg:items-start">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold text-white">{experience.position}</h3>
                          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-400">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                             
                            </span>
                            <span>•</span>
                            <span>{formatDate(experience.interviewDate)}</span>
                          </div>
                          <p className="text-gray-300 ">{experience.description}</p>
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
                          <h4 className="mb-2 text-sm font-medium text-gray-400">Interview Rounds:</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.rounds.map((round, index) => (
                              <span key={index} className="px-2 py-1 text-xs text-gray-200 rounded-full bg-gray-600/50">
                                {round}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {experience.tips && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-medium text-gray-400">Tips:</h4>
                          <p className="text-sm text-gray-300">{experience.tips}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-3 pt-3 text-sm text-gray-400 border-t border-gray-700 sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex flex-wrap gap-4">
                          {experience.location && (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {experience.location}
                            </span>
                          )}
                          {experience.salary && (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {experience.salary}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {experience.views || 0}
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="py-16 text-center">
                  <div className="mb-4 text-lg text-gray-400">No experiences shared yet</div>
                  <p className="mb-6 text-gray-500">Be the first to share your interview experience at {company.name}</p>
                  <a href="/add-experience" className="inline-block px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                    Share Your Experience
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">AI-Generated Summary</h3>
                {experiences.length > 0 && (
                  <button
                    onClick={regenerateSummary}
                    disabled={isGeneratingSummary}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-800"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate Summary'
                    )}
                  </button>
                )}
              </div>
              
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-xl text-white">Generating AI summary...</div>
                </div>
              ) : summary ? (
                <div className="prose prose-invert max-w-none">
<ReactMarkdown
  components={{
    p: ({ children }) => (
      <p className="mb-3 leading-relaxed text-gray-300">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-6 mb-3 text-xl font-bold text-blue-400">{children}</h2>
    ),
    li: ({ children }) => (
      <li className="ml-5 text-gray-300 list-disc">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    )
  }}
>
  {summary}
</ReactMarkdown>

</div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  {experiences.length > 0 
                    ? "No summary available. Click 'Regenerate Summary' to create one." 
                    : "Not enough experiences to generate a summary yet."
                  }
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-6 rounded-lg bg-gray-700/30">
                  <h3 className="mb-4 text-lg font-semibold text-white">Application Success Rate</h3>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-400">Accepted</span>
                      <span className="text-green-400">
                        {experiences.length > 0 
                          ? Math.round((experiences.filter(exp => exp.offerStatus === 'Accepted').length / experiences.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ 
                          width: `${experiences.length > 0 
                            ? (experiences.filter(exp => exp.offerStatus === 'Accepted').length / experiences.length) * 100
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-400">Rejected</span>
                      <span className="text-red-400">
                        {experiences.length > 0 
                          ? Math.round((experiences.filter(exp => exp.offerStatus === 'Rejected').length / experiences.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ 
                          width: `${experiences.length > 0 
                            ? (experiences.filter(exp => exp.offerStatus === 'Rejected').length / experiences.length) * 100
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg bg-gray-700/30">
                  <h3 className="mb-4 text-lg font-semibold text-white">Difficulty Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-400">Easy</span>
                        <span className="text-green-400">
                          {experiences.filter(exp => exp.difficulty === 'Easy').length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${experiences.length > 0 
                              ? (experiences.filter(exp => exp.difficulty === 'Easy').length / experiences.length) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-400">Medium</span>
                        <span className="text-yellow-400">
                          {experiences.filter(exp => exp.difficulty === 'Medium').length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full" 
                          style={{ 
                            width: `${experiences.length > 0 
                              ? (experiences.filter(exp => exp.difficulty === 'Medium').length / experiences.length) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-400">Hard</span>
                        <span className="text-red-400">
                          {experiences.filter(exp => exp.difficulty === 'Hard').length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-red-500 rounded-full" 
                          style={{ 
                            width: `${experiences.length > 0 
                              ? (experiences.filter(exp => exp.difficulty === 'Hard').length / experiences.length) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg bg-gray-700/30 md:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold text-white">Popular Positions</h3>
                  <div className="space-y-2">
                    {Object.entries(
                      experiences.reduce((acc, exp) => {
                        acc[exp.position] = (acc[exp.position] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([position, count]) => (
                        <div key={position} className="flex items-center justify-between">
                          <span className="text-gray-300">{position}</span>
                          <span className="text-sm text-gray-400">{count} {count === 1 ? 'experience' : 'experiences'}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;