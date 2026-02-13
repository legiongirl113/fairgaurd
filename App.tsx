
import React, { useState, useEffect } from 'react';
import { AppState, Child, ActivityType, ActivityRecord, Chore } from './types';
import Sidebar from './components/Sidebar';
import { generateConsequence } from './services/geminiService';
import { INITIAL_CHORES, REWARDS, AVATARS } from './constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fairguard_state');
    if (saved) return JSON.parse(saved);
    return {
      children: [],
      selectedChildId: null
    };
  });

  const [behaviorInput, setBehaviorInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastConsequence, setLastConsequence] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'behaviors' | 'chores' | 'rewards' | 'history'>('behaviors');
  // New state for mobile navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('fairguard_state', JSON.stringify(state));
  }, [state]);

  const selectedChild = state.children.find(c => c.id === state.selectedChildId);

  // Close sidebar automatically on mobile when a child is selected
  const handleSelectChild = (id: string) => {
    setState(prev => ({ ...prev, selectedChildId: id }));
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddChild = (name: string, age: number) => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      name,
      age,
      points: 0,
      avatar: AVATARS[state.children.length % AVATARS.length],
      history: []
    };
    setState(prev => ({
      ...prev,
      children: [...prev.children, newChild],
      selectedChildId: prev.selectedChildId || newChild.id
    }));
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogChore = (chore: Chore) => {
    if (!selectedChild) return;
    
    const newRecord: ActivityRecord = {
      id: crypto.randomUUID(),
      type: ActivityType.CHORE,
      description: `Completed: ${chore.title}`,
      outcome: `Earned ${chore.points} points!`,
      pointsChange: chore.points,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      children: prev.children.map(c => 
        c.id === selectedChild.id 
          ? { ...c, points: c.points + chore.points, history: [newRecord, ...c.history] }
          : c
      )
    }));
  };

  const handleRedeemReward = (reward: typeof REWARDS[0]) => {
    if (!selectedChild || selectedChild.points < reward.cost) return;

    const newRecord: ActivityRecord = {
      id: crypto.randomUUID(),
      type: ActivityType.REWARD_REDEMPTION,
      description: `Redeemed: ${reward.title}`,
      outcome: `Spent ${reward.cost} points`,
      pointsChange: -reward.cost,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      children: prev.children.map(c => 
        c.id === selectedChild.id 
          ? { ...c, points: c.points - reward.cost, history: [newRecord, ...c.history] }
          : c
      )
    }));
  };

  const handleConsequenceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !behaviorInput.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateConsequence(behaviorInput, selectedChild.age, selectedChild.name);
      setLastConsequence(result);
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Failed to generate consequence. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmConsequence = () => {
    if (!selectedChild || !lastConsequence) return;

    const newRecord: ActivityRecord = {
      id: crypto.randomUUID(),
      type: ActivityType.BEHAVIOR,
      description: behaviorInput,
      outcome: lastConsequence.consequence,
      pointsChange: -lastConsequence.pointsDeduction,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      children: prev.children.map(c => 
        c.id === selectedChild.id 
          ? { ...c, points: Math.max(0, c.points - lastConsequence.pointsDeduction), history: [newRecord, ...c.history] }
          : c
      )
    }));

    setBehaviorInput('');
    setLastConsequence(null);
    setActiveTab('history');
  };

  const chartData = selectedChild?.history
    .filter(h => h.type !== ActivityType.BEHAVIOR || h.pointsChange !== 0)
    .slice(0, 10)
    .reverse()
    .reduce((acc: any[], curr) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].points : 0;
      acc.push({
        time: new Date(curr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        points: lastValue + curr.pointsChange
      });
      return acc;
    }, []) || [];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - conditionally rendered/visible based on screen size and state */}
      <Sidebar 
        className={`${isSidebarOpen ? 'w-full md:w-80' : 'hidden md:flex md:w-80'}`}
        children={state.children} 
        selectedChildId={state.selectedChildId}
        onSelectChild={handleSelectChild}
        onAddChild={handleAddChild}
      />

      <main className={`flex-1 flex flex-col overflow-hidden relative ${isSidebarOpen && 'hidden md:flex'}`}>
        {!selectedChild ? (
          <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-white m-4 md:m-6 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-center max-w-md">
              <div className="mb-6 w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Parent Portal</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Add a child's profile in the sidebar to begin managing behaviors, chores, and rewards.</p>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg"
              >
                Go to Profiles
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="px-6 md:px-8 py-5 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center w-full md:w-auto">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden mr-4 p-2 text-slate-400 hover:text-indigo-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img src={selectedChild.avatar} alt={selectedChild.name} className="w-12 md:w-16 h-12 md:h-16 rounded-full border-4 border-indigo-100 shadow-sm mr-4 object-cover" />
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{selectedChild.name}</h2>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{selectedChild.age} Years Old</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-indigo-600 px-6 py-2 md:py-3 rounded-2xl shadow-lg shadow-indigo-100 flex-1 md:flex-none flex flex-row md:flex-col items-center justify-between md:justify-center md:min-w-[140px]">
                  <span className="text-indigo-100 text-[10px] uppercase font-black tracking-widest md:mb-1">Points Balance</span>
                  <span className="text-white text-xl md:text-2xl font-black">{selectedChild.points}</span>
                </div>
              </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="px-6 md:px-8 mt-4 md:mt-6 flex gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              {(['behaviors', 'chores', 'rewards', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 text-sm font-black capitalize transition-all duration-200 whitespace-nowrap border-b-2 ${
                    activeTab === tab 
                      ? 'text-indigo-600 border-indigo-600' 
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {activeTab === 'behaviors' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-black mb-4 text-slate-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Log a Behavior
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 font-medium">Type in what happened. Gemini AI will suggest a fair consequence for a {selectedChild.age}-year-old.</p>
                    
                    <form onSubmit={handleConsequenceAction} className="space-y-5">
                      <textarea
                        value={behaviorInput}
                        onChange={(e) => setBehaviorInput(e.target.value)}
                        placeholder="e.g., Did not clean room after 3 reminders, or used a disrespectful tone during dinner..."
                        className="w-full h-40 p-5 bg-white border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-950 font-medium text-lg placeholder:text-slate-300 resize-none outline-none shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !behaviorInput.trim()}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center transition-all ${
                          isGenerating || !behaviorInput.trim()
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98]'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          'Get Fair Consequence'
                        )}
                      </button>
                    </form>
                  </section>

                  {lastConsequence && (
                    <section className="bg-gradient-to-br from-indigo-50/50 to-white p-6 md:p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-400">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="shrink-0 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1 space-y-8">
                          <div>
                            <h4 className="text-slate-900 font-black text-2xl mb-3 tracking-tight">Fair Outcome</h4>
                            <div className="text-indigo-950 leading-relaxed font-bold text-lg bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
                              {lastConsequence.consequence}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white/80 p-5 rounded-2xl border border-indigo-100">
                              <h5 className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-2">Psychology Behind It</h5>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium">{lastConsequence.reasoning}</p>
                            </div>
                            <div className="bg-white/80 p-5 rounded-2xl border border-indigo-100 flex flex-col justify-center items-center">
                              <h5 className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-1">Point Fine</h5>
                              <p className="text-3xl font-black text-rose-500">-{lastConsequence.pointsDeduction}</p>
                            </div>
                          </div>

                          <div className="bg-indigo-600 p-7 rounded-[2rem] text-white shadow-xl">
                            <h5 className="text-[10px] uppercase font-black text-indigo-200 tracking-widest mb-3">Conversation Starter</h5>
                            <p className="italic font-bold text-xl leading-tight">"{lastConsequence.conversationStarter}"</p>
                          </div>

                          <div className="flex flex-col md:flex-row gap-3 pt-4">
                            <button 
                              onClick={() => setLastConsequence(null)}
                              className="flex-1 py-4 text-slate-400 font-black text-sm border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors"
                            >
                              Discard Idea
                            </button>
                            <button 
                              onClick={confirmConsequence}
                              className="flex-[2] py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-[0.98] transition-all"
                            >
                              Confirm & Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'chores' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {INITIAL_CHORES.map(chore => (
                      <button
                        key={chore.id}
                        onClick={() => handleLogChore(chore)}
                        className="group bg-white p-7 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all text-left relative overflow-hidden active:scale-95"
                      >
                        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-20 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                          +{chore.points} Pts
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{chore.title}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tap to complete</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] mb-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-indigo-200">
                    <div className="text-center md:text-left">
                      <h3 className="font-black text-white text-3xl mb-1">Point Redemption</h3>
                      <p className="text-indigo-200 font-bold">Hard work pays off!</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 shadow-inner flex flex-col items-center">
                      <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Available Balance</span>
                      <span className="text-4xl font-black text-white">{selectedChild.points}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {REWARDS.map(reward => (
                      <div 
                        key={reward.id}
                        className={`p-7 rounded-[2rem] border-2 transition-all flex justify-between items-center shadow-sm ${
                          selectedChild.points >= reward.cost
                            ? 'bg-white border-slate-100 hover:shadow-xl hover:border-indigo-100'
                            : 'bg-slate-50 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="pr-4">
                          <h4 className="font-black text-slate-900 text-lg mb-1 leading-tight">{reward.title}</h4>
                          <span className={`text-xs font-black uppercase tracking-widest ${selectedChild.points >= reward.cost ? 'text-indigo-500' : 'text-slate-400'}`}>
                            {reward.cost} Points
                          </span>
                        </div>
                        <button
                          disabled={selectedChild.points < reward.cost}
                          onClick={() => handleRedeemReward(reward)}
                          className={`px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-md active:scale-90 ${
                            selectedChild.points >= reward.cost
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Redeem
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
                  {chartData.length > 1 && (
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Growth Trend</h3>
                      <div className="h-[280px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900}}
                            />
                            <Area type="monotone" dataKey="points" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorPoints)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  )}

                  <section className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline
                    </h3>
                    <div className="space-y-4">
                      {selectedChild.history.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
                          <p className="text-slate-400 font-bold italic">Waiting for the first activity record...</p>
                        </div>
                      ) : (
                        selectedChild.history.map(record => (
                          <div key={record.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                                record.type === ActivityType.CHORE ? 'bg-emerald-50 text-emerald-600' :
                                record.type === ActivityType.BEHAVIOR ? 'bg-rose-50 text-rose-600' :
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {record.type === ActivityType.CHORE && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {record.type === ActivityType.BEHAVIOR && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {record.type === ActivityType.REWARD_REDEMPTION && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <h5 className="font-black text-slate-900 leading-tight mb-1">{record.description}</h5>
                                <p className="text-sm text-slate-500 font-bold leading-tight">{record.outcome}</p>
                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">
                                  {new Date(record.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            </div>
                            <div className={`text-base font-black px-4 py-2 rounded-2xl shadow-sm ${
                              record.pointsChange > 0 ? 'text-emerald-600 bg-emerald-50' :
                              record.pointsChange < 0 ? 'text-rose-600 bg-rose-50' :
                              'text-slate-400 bg-slate-100'
                            }`}>
                              {record.pointsChange > 0 ? '+' : ''}{record.pointsChange}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
