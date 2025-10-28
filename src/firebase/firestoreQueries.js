import { collection, doc, addDoc, getDoc, getDocs,deleteDoc, query, orderBy, limit, where, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Companies collection
export const getCompanies = async () => {
  const companiesCollection = collection(db, 'companies');
  const q = query(companiesCollection, orderBy('experienceCount', 'desc'));
  const companiesSnapshot = await getDocs(q);
  return companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCompanyById = async (id) => {
  const companyDoc = doc(db, 'companies', id);
  const companySnapshot = await getDoc(companyDoc);
  return companySnapshot.exists() ? { id: companySnapshot.id, ...companySnapshot.data() } : null;
};

export const addCompany = async (companyData) => {
  const companiesCollection = collection(db, 'companies');
  return await addDoc(companiesCollection, {
    ...companyData,
    experienceCount: 0,
    lastUpdated: serverTimestamp(),
    summary: ""
  });
};

export const updateCompanySummary = async (companyId, summary) => {
  const companyDoc = doc(db, 'companies', companyId);
  await updateDoc(companyDoc, {
    summary: summary,
    lastUpdated: serverTimestamp()
  });
};

export const incrementCompanyExperienceCount = async (companyId) => {
  const companyDoc = doc(db, 'companies', companyId);
  await updateDoc(companyDoc, {
    experienceCount: increment(1),
    lastUpdated: serverTimestamp()
  });
};

// Experiences collection
export const getExperiencesByCompanyId = async (companyId) => {
  console.log("Getting experiences for company ID:", companyId);
  
  try {
    // First, let's check if there are any experiences at all
    const allExperiencesQuery = query(collection(db, 'experiences'));
    const allExperiencesSnapshot = await getDocs(allExperiencesQuery);
    console.log("Total experiences in database:", allExperiencesSnapshot.docs.length);
    
    // Log all experiences with their companyId for debugging
    allExperiencesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Experience ID: ${doc.id}, Company ID: ${data.companyId}, Company Name: ${data.companyName}`);
    });
    
    // Now try the specific query
    const experiencesQuery = query(
      collection(db, 'experiences'),
      where('companyId', '==', companyId),
      
    );
    
 
    const experiencesSnapshot = await getDocs(experiencesQuery);
   
    const experiences = experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return experiences;
  } catch (error) {
    console.error("Error in getExperiencesByCompanyId:", error);
    throw error;
  }
};

// Alternative function to get experiences by company name (for debugging)
export const getExperiencesByCompanyName = async (companyName) => {
  console.log("Getting experiences for company name:", companyName);
  
  try {
    const experiencesQuery = query(
      collection(db, 'experiences'),
      where('companyName', '==', companyName),
      orderBy('interviewDate', 'desc')
    );
    
    const experiencesSnapshot = await getDocs(experiencesQuery);
    console.log("Query result count by name:", experiencesSnapshot.docs.length);
    
    const experiences = experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched experiences by name:", experiences);
    
    return experiences;
  } catch (error) {
    console.error("Error in getExperiencesByCompanyName:", error);
    throw error;
  }
};

export const addExperience = async (experienceData) => {
  const experiencesCollection = collection(db, 'experiences');
  const docRef = await addDoc(experiencesCollection, {
    ...experienceData,
    createdAt: serverTimestamp(),
    upvotes: 0,
    views: 0
  });
  
  // Update company experience count
  await incrementCompanyExperienceCount(experienceData.companyId);
  
  return docRef;
};

export const getAllExperiences = async () => {
  const experiencesQuery = query(
    collection(db, 'experiences'),
    orderBy('interviewDate', 'desc'),
    limit(20)
  );
  const experiencesSnapshot = await getDocs(experiencesQuery);
  return experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const upvoteExperience = async (experienceId) => {
  const experienceDoc = doc(db, 'experiences', experienceId);
  await updateDoc(experienceDoc, {
    upvotes: increment(1)
  });
};
// Add this function to your firestoreQueries.js file
export const getExperiencesByUserId = async (userId) => {
  const experiencesQuery = query(
    collection(db, 'experiences'),
    where('userId', '==', userId)   
  );
  const experiencesSnapshot = await getDocs(experiencesQuery);
  return experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const incrementExperienceViews = async (experienceId) => {
  const experienceDoc = doc(db, 'experiences', experienceId);
  await updateDoc(experienceDoc, {
    views: increment(1)
  });
};
// Add these functions to your firestoreQueries.js file

export const deleteExperience = async (experienceId) => {
  const experienceDoc = doc(db, 'experiences', experienceId);
  await deleteDoc(experienceDoc);
};

export const updateExperience = async (experienceId, experienceData) => {
  const experienceDoc = doc(db, 'experiences', experienceId);
  await updateDoc(experienceDoc, {
    ...experienceData,
    lastUpdated: serverTimestamp()
  });
};
// Users collection
export const getUserProfile = async (userId) => {
  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);
  return userSnapshot.exists() ? { id: userSnapshot.id, ...userSnapshot.data() } : null;
};

export const updateUserProfile = async (userId, userData) => {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, userData);
};