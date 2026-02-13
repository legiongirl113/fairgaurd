
import React from 'react';
import { Child } from '../types';

interface ChildCardProps {
  child: Child;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(child.id)}
      className={`flex items-center p-4 rounded-xl transition-all duration-200 border-2 w-full text-left ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200' 
          : 'border-slate-200 bg-white hover:border-indigo-300'
      }`}
    >
      <img src={child.avatar} alt={child.name} className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-sm" />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-bold text-slate-800 truncate">{child.name}</h3>
        <p className="text-xs text-slate-500">{child.age} Years Old</p>
      </div>
      <div className="ml-2 text-right">
        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {child.points} pts
        </span>
      </div>
    </button>
  );
};

export default ChildCard;
