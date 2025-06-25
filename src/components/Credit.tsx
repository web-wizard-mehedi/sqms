import React from 'react';

interface CreditProps {
  mentorName: string;
  mentorImage: string;
  studentName: string;
  studentImage: string;
}

const Credit: React.FC<CreditProps> = ({ mentorName, mentorImage, studentName, studentImage }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-16 bg-white rounded-2xl shadow-lg p-10 mt-8 max-w-4xl mx-auto border-2 border-teal-200">
      <div className="flex flex-col items-center">
        <img
          src={studentImage}
          alt={studentName}
          className="w-56 h-56 rounded-full object-cover border-8 border-blue-400 mb-4 shadow-lg"
        />
        <span className="font-semibold text-blue-600 text-2xl">Developed By</span>
        <span className="text-gray-800 font-bold text-3xl mt-1">{studentName}</span>
      </div>
      <div className="flex flex-col items-center">
        <img
          src={mentorImage}
          alt={mentorName}
          className="w-56 h-56 rounded-full object-cover border-8 border-teal-500 mb-4 shadow-lg"
        />
        <span className="font-semibold text-teal-700 text-2xl">Mentored By</span>
        <span className="text-gray-800 font-bold text-3xl mt-1">{mentorName}</span>
      </div>
    </div>
  );
};

export default Credit;
