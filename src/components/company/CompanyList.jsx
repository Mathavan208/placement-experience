// src/components/company/CompanyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../../firebase/firestoreQueries';
import CompanyCard from './CompanyCard';
import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [sortBy, setSortBy] = useState('experienceCount');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await getCompanies();
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by industry
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    // Sort companies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experienceCount':
        default:
          return (b.experienceCount || 0) - (a.experienceCount || 0);
      }
    });

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, selectedIndustry, sortBy]);

  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FuzzyText color="#fff" fontSize="clamp(2rem, 5vw, 3rem)" className="font-bold mb-4">
            Explore Companies
          </FuzzyText>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover interview experiences from top companies across various industries
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Companies</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, industry, or description..."
                  className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="experienceCount">Most Experiences</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm flex items-center">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedIndustry !== 'all' && (
              <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center">
                Industry: {selectedIndustry}
                <button
                  onClick={() => setSelectedIndustry('all')}
                  className="ml-2 hover:text-purple-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            Showing <span className="font-semibold text-white">{filteredCompanies.length}</span> of{' '}
            <span className="font-semibold text-white">{companies.length}</span> companies
          </div>
          {filteredCompanies.length === 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('all');
                setSortBy('experienceCount');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">No companies found</div>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedIndustry !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No companies have been added yet'}
            </p>
            {(searchTerm || selectedIndustry !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndustry('all');
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Popular Industries Section */}
        {companies.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <FuzzyText color="#fff" fontSize="2rem" className="font-semibold mb-4">
                Popular Industries
              </FuzzyText>
              <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(
                companies.reduce((acc, company) => {
                  const industry = company.industry || 'Other';
                  acc[industry] = (acc[industry] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([industry, count]) => (
                  <div
                    key={industry}
                    className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center hover:bg-gray-800/70 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    <div className="text-lg font-semibold text-white mb-1">{industry}</div>
                    <div className="text-sm text-gray-400">{count} companies</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;