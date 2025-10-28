import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import ElectricBorder from '../animations/ElectricBorder';
import FuzzyText from '../animations/FuzzyText';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        createdAt: new Date(),
        bio: '',
        profilePicture: '',
        experiences: []
      });
      
      navigate('/');
    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-xl p-8">
        <FuzzyText color="#fff" fontSize="2rem" className="mb-6 text-center">Sign Up</FuzzyText>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div className="pt-2">
            <ElectricBorder
              color="#5227FF"
              speed={1}
              chaos={1}
              thickness={2}
              className="w-full"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Sign Up'}
              </button>
            </ElectricBorder>
          </div>
        </form>

        <div className="mt-6 text-center text-gray-400">
          <p>Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;