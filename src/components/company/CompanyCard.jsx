// src/components/company/CompanyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';

const CompanyCard = ({ company }) => {
  return (
    <Link to={`/company/${company.id}`} className="block h-full group">
      <ElectricBorder
        color="#5227FF"
        speed={1}
        chaos={1}
        thickness={2}
        className="h-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl hover:bg-gray-800/70 transition-all duration-300 hover:shadow-2xl hover:transform hover:scale-105"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl font-bold text-white">
                {company.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <FuzzyText color="#fff" fontSize="1.1rem" className="font-semibold truncate">{company.name}</FuzzyText>
              <p className="text-gray-400 text-sm truncate">{company.industry || 'Technology'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1">{company.rating || 'N/A'}</span>
            </div>
            <div className="text-gray-400 text-sm">
              <span>{company.experienceCount || 0} experiences</span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm line-clamp-2 mb-4 flex-1">
            {company.description || 'No description available for this company.'}
          </p>
          
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span className="truncate flex-1 mr-2">{company.headquarters || 'Multiple locations'}</span>
              <span>Founded: {company.founded || 'N/A'}</span>
            </div>
          </div>
        </div>
      </ElectricBorder>
    </Link>
  );
};

export default CompanyCard;