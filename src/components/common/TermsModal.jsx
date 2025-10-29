import React, { useState } from "react";
import { doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function TermsModal({ user, onClose }) {
  const [checked, setChecked] = useState(false);
  const handleAgree = async () => {
    if (!checked) return;
    console.log(user.uid);
    const userDoc = doc(db, "users", user.uid);
    console.log(userDoc);
    const data= {
      termsAccepted: {
        accepted: true,
        acceptedAt: serverTimestamp(),  
        version: "1.0",
      },
    }
    await updateDoc(userDoc,data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-800 p-6 rounded-xl w-[90%] max-w-lg text-white">
        <h2 className="mb-4 text-2xl font-bold">Terms of Use</h2>
        <p className="mb-3 text-sm">
          Welcome to our Placement Experience Portal! By accessing or using this website,
          you agree to the following terms:
        </p>
        <ul className="pl-6 space-y-1 text-sm list-disc">
          <li>Create an account to post or edit experiences</li>
          <li>All experiences must be honest & based on real experiences</li>
          <li>Do not share confidential company information</li>
          <li>Offensive or false content will be removed</li>
          <li>You may delete or edit your own experience anytime</li>
        </ul>

        <h3 className="mt-4 mb-2 text-xl font-semibold">Disclaimer</h3>
        <p className="text-sm">
          All experiences belong to individual students and do not represent company views.
          This platform is only for educational and informational purposes.
        </p>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            onChange={(e) => setChecked(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">I have read and agree to the Terms & Disclaimer</span>
        </div>

        <button
          disabled={!checked}
          onClick={handleAgree}
          className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${checked
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-500 cursor-not-allowed"
            }`}
        >
          Agree & Continue
        </button>
      </div>
    </div>
  );
}
