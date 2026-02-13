
import React, { useState } from 'react';
import { Child } from '../types';
import ChildCard from './ChildCard';
import { AVATARS } from '../constants';

interface SidebarProps {
  children: Child[];
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  onAddChild: (name: string, age: number) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ children, selectedChildId, onSelectChild, onAddChild, className = "" }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newAge) {
      onAddChild(newName.trim(), newAge);
      setNewName('');
      setNewAge(8);
      setIsAdding(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0 ${className}`}>
      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">FairGuard</h1>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Profiles</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
            title="Add Child"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 bg-slate-50 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-200 shadow-inner">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Child Name</label>
              <input 
                autoFocus
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input 
                type="number" 
                value={newAge} 
                onChange={(e) => setNewAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                min="1"
                max="25"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {children.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm italic">No children profiles yet.</p>
          </div>
        ) : (
          children.map(child => (
            <ChildCard 
              key={child.id} 
              child={child} 
              isSelected={selectedChildId === child.id}
              onSelect={onSelectChild}
            />
          ))
        )}
      </div>
      
      <div className="p-6 border-t border-slate-100 bg-white">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">FairGuard Parenting System</p>
      </div>
    </div>
  );
};

export default Sidebar;
