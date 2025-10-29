import React, { useState, useEffect } from 'react';
import { addExperience, getCompanies, addCompany } from '../../firebase/firestoreQueries';
import { useNavigate } from 'react-router-dom';
import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';

const AddExperienceForm = ({ user }) => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    // Experience fields
    companyName: '',
    position: '',
    description: '',
    rounds: [],
    tips: '',
    difficulty: '',
    offerStatus: '',
    salary: '',
    location: '',
    interviewDate: '',
    
    // New company fields
    isNewCompany: false,
    newCompanyName: '',
    newCompanyIndustry: '',
    newCompanyDescription: '',
    newCompanyWebsite: '',
    newCompanyHeadquarters: '',
    newCompanyFounded: '',
    newCompanyEmployeeCount: ''
  });
  const [roundInput, setRoundInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddRound = () => {
    if (roundInput.trim()) {
      setFormData(prev => ({
        ...prev,
        rounds: [...prev.rounds, roundInput.trim()]
      }));
      setRoundInput('');
    }
  };

  const handleRemoveRound = (index) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index)
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    let companyId = formData.companyName;

    if (formData.isNewCompany) {
      const newCompanyData = {
        name: formData.newCompanyName,
        industry: formData.newCompanyIndustry,
        description: formData.newCompanyDescription || "",
        website: formData.newCompanyWebsite || "",
        headquarters: formData.newCompanyHeadquarters || "",
        founded: formData.newCompanyFounded ? parseInt(formData.newCompanyFounded) : null,
        employeeCount: formData.newCompanyEmployeeCount || "",
        rating: 0,
        experienceCount: 0,
        lastUpdated: new Date(),
        summary: ""
      };

      const companyDoc = await addCompany(newCompanyData);
      companyId = companyDoc.id;
    }

    const experienceData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      companyId: companyId,
      companyName: formData.isNewCompany
        ? formData.newCompanyName
        : companies.find(c => c.id === formData.companyName)?.name || '',

      position: formData.position,
      description: formData.description,
      rounds: formData.rounds,
      tips: formData.tips || "",
      difficulty: formData.difficulty || "",
      offerStatus: formData.offerStatus || "",
      salary: formData.salary || "",
      location: formData.location || "",
      interviewDate: formData.interviewDate ? new Date(formData.interviewDate) : null,
      createdAt: new Date(),
      upvotes: 0,
      views: 0
    };

    await addExperience(experienceData);
    navigate('/');
  } catch (err) {
    console.error('Error adding experience:', err);
    setError('Failed to add experience. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  // Get today's date in YYYY-MM-DD format for the max attribute of the date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl p-6 mx-auto bg-gray-800 rounded-lg shadow-xl bg-opacity-80 backdrop-blur-md">
      <FuzzyText color="#fff" fontSize="2rem" className="mb-6">Share Your Experience</FuzzyText>
      
      {error && (
        <div className="p-3 mb-4 text-red-200 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Selection or Creation */}
        <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
          <div className="flex items-center mb-4 space-x-2">
            <input
              type="checkbox"
              id="isNewCompany"
              name="isNewCompany"
              checked={formData.isNewCompany}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isNewCompany" className="text-sm font-medium text-white">Add a new company</label>
          </div>
          
          {formData.isNewCompany ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">New Company Details</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="newCompanyName" className="block mb-2 text-sm font-medium">Company Name *</label>
                  <input
                    type="text"
                    id="newCompanyName"
                    name="newCompanyName"
                    value={formData.newCompanyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newCompanyIndustry" className="block mb-2 text-sm font-medium">Industry</label>
                  <input
                    type="text"
                    id="newCompanyIndustry"
                    name="newCompanyIndustry"
                    value={formData.newCompanyIndustry}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Finance"
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newCompanyWebsite" className="block mb-2 text-sm font-medium">Website</label>
                  <input
                    type="url"
                    id="newCompanyWebsite"
                    name="newCompanyWebsite"
                    value={formData.newCompanyWebsite}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newCompanyHeadquarters" className="block mb-2 text-sm font-medium">Headquarters</label>
                  <input
                    type="text"
                    id="newCompanyHeadquarters"
                    name="newCompanyHeadquarters"
                    value={formData.newCompanyHeadquarters}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newCompanyFounded" className="block mb-2 text-sm font-medium">Founded Year</label>
                  <input
                    type="number"
                    id="newCompanyFounded"
                    name="newCompanyFounded"
                    value={formData.newCompanyFounded}
                    onChange={handleChange}
                    placeholder="e.g. 2010"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newCompanyEmployeeCount" className="block mb-2 text-sm font-medium">Employee Count</label>
                  <input
                    type="text"
                    id="newCompanyEmployeeCount"
                    name="newCompanyEmployeeCount"
                    value={formData.newCompanyEmployeeCount}
                    onChange={handleChange}
                    placeholder="e.g. 1000-5000"
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="newCompanyDescription" className="block mb-2 text-sm font-medium">Company Description</label>
                <textarea
                  id="newCompanyDescription"
                  name="newCompanyDescription"
                  value={formData.newCompanyDescription}
                  onChange={handleChange}
                  placeholder="Brief description of the company..."
                  rows={3}
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="companyName" className="block mb-2 text-sm font-medium">Select Company *</label>
              <select
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Experience Details */}
        <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
          <h3 className="mb-4 text-lg font-semibold text-white">Experience Details</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="position" className="block mb-2 text-sm font-medium">Position *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                required
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="interviewDate" className="block mb-2 text-sm font-medium">Interview Date *</label>
              <input
                type="date"
                id="interviewDate"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                max={today}
                required
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block mb-2 text-sm font-medium">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="offerStatus" className="block mb-2 text-sm font-medium">Offer Status</label>
              <select
                id="offerStatus"
                name="offerStatus"
                value={formData.offerStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="salary" className="block mb-2 text-sm font-medium">Salary Range</label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $80,000 - $100,000"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block mb-2 text-sm font-medium">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block mb-2 text-sm font-medium">Experience Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your interview experience in detail..."
              required
              rows={5}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">Interview Rounds</label>
            <div className="flex mb-2 space-x-2">
              <input
                type="text"
                value={roundInput}
                onChange={(e) => setRoundInput(e.target.value)}
                placeholder="e.g. Technical Round 1"
                className="flex-1 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddRound}
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.rounds.map((round, index) => (
                <div key={index} className="flex items-center px-3 py-1 bg-gray-600 rounded-full">
                  <span className="text-sm">{round}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(index)}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="tips" className="block mb-2 text-sm font-medium">Tips for Future Candidates</label>
            <textarea
              id="tips"
              name="tips"
              value={formData.tips}
              onChange={handleChange}
              placeholder="Share any tips or advice for future candidates..."
              rows={3}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        <button type="submit" disabled={isSubmitting} className="relative">
  <ElectricBorder
    color="#5227FF"
    speed={1}
    chaos={1}
    thickness={2}
    className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700"
  >
    {isSubmitting ? 'Submitting...' : 'Submit Experience'}
  </ElectricBorder>
</button>

        </div>
      </form>
    </div>
  );
};

export default AddExperienceForm;