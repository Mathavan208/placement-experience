// src/pages/AddExperience.jsx
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import AddExperienceForm from '../components/forms/AddExperienceForm';
import { Navigate } from 'react-router-dom';

const AddExperience = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <AddExperienceForm user={user} />
    </div>
  );
};

export default AddExperience;