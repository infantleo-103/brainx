import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function StudentCourseDetails() {
    const { courseId } = useParams();
    const [notesOpen, setNotesOpen] = useState(false);

    // Placeholder data - in a real app, fetch based on courseId
    const courseTitle = "Algorithm Analysis & Design";

    return (
        <div className="flex flex-col h-full overflow-hidden relative font-display text-[#120f1a]">
            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/student/my-courses" className="text-gray-500 hover:text-primary transition-colors">My Courses</Link>
                    <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                    <span className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">{courseTitle}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-600">Course Progress</span>
                            <span className="text-xs font-bold text-primary">75%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(80,35,196,0.4)] w-3/4"></div>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors">
                            <img alt="User" className="w-8 h-8 rounded-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzCdEGbiSgzb6mkQY8JzP3lonBXqNXoXLJDsaPmigfu9poHengqidG76ZmnH4b-Hgkm_4wktSyp-52tEviF7t1b2Ab0MV5wONdH3e84D21ZgkMbmVJUlld33TiD57LjfYRAn9KTe4D00p2ThtjyOjVWSX_ujnGsT3w-J0H3pq0qLXaXL7kzB0u2biQLoyXlpvRssP78axJ_mN299GYmwbuC9ZB7NTxGoa77LZJdhBXabKUKvw-eH09wpcb2xhJhYLyrUQdja01Cg" />
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-background-light">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">

                    {/* Left Column: Video & Lessons */}
                    <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
                        {/* Video Player Area */}
                        <div className="bg-black rounded-2xl overflow-hidden shadow-deep-purple relative aspect-video group">
                            <img alt="Video Thumbnail" className="w-full h-full object-cover opacity-80"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCePu11tYQB6YoUg2pOPDjHEA0Hx5bcwaVWkIe3rvThwznOcHENEI61Tq_rGBR5-NCdwQDeaL9afPCCAbZlrre3RmNxQvaxkKTbqodF1bJiQ5T-K2WaKefuwNxZcBCILQLhruo94mryMyQg8O-NQRww6WnDi5QbOGYmOGNSnTbh0SmYAxx40zf_SL5iXZ0lEeCOdqDV16LsNNjDkHG9ilJ2KdmB8Wk83zUetbluXJiinWfmNxbwtEOQZAY0udIF-Xr5GpPxSOzdLMk" />
                            <div className="absolute inset-0 video-gradient flex flex-col justify-end p-6" style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)' }}>
                                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 cursor-pointer">
                                    <div className="w-20 h-20 rounded-full glass-overlay flex items-center justify-center shadow-2xl backdrop-blur-md" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                        <span className="material-symbols-outlined text-white text-4xl fill-current">play_arrow</span>
                                    </div>
                                </div>
                                <div className="glass-overlay p-4 rounded-xl flex items-center gap-4 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                    <button className="hover:text-primary-light transition-colors"><span className="material-symbols-outlined">play_arrow</span></button>
                                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                                        <div className="w-1/3 h-full bg-primary rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-medium">12:45 / 45:00</span>
                                    <button className="hover:text-primary-light transition-colors"><span className="material-symbols-outlined">volume_up</span></button>
                                    <button className="hover:text-primary-light transition-colors"><span className="material-symbols-outlined">fullscreen</span></button>
                                </div>
                            </div>
                            <div className="absolute top-6 right-6">
                                <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-red-400/30 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> REC
                                </span>
                            </div>
                        </div>

                        {/* Lesson List */}
                        <div className="bg-white rounded-2xl p-6 shadow-card flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center gap-6 border-b border-gray-100 pb-4 mb-6 overflow-x-auto">
                                <button className="text-primary font-bold border-b-2 border-primary pb-4 -mb-4 px-2 whitespace-nowrap">Overview</button>
                                <button className="text-gray-500 hover:text-gray-900 font-medium pb-4 -mb-4 px-2 whitespace-nowrap transition-colors">Resources</button>
                                <button className="text-gray-500 hover:text-gray-900 font-medium pb-4 -mb-4 px-2 whitespace-nowrap transition-colors">Announcements</button>
                                <button className="text-gray-500 hover:text-gray-900 font-medium pb-4 -mb-4 px-2 whitespace-nowrap transition-colors">Q&amp;A</button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Module 3: Graph Algorithms</h3>
                                <div className="space-y-3">
                                    <div className="bg-primary-light/50 border border-primary/10 p-4 rounded-xl flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-primary text-sm mb-1">Lesson 3.1: Depth-First Search</h4>
                                                <span className="text-xs text-primary font-medium bg-white px-2 py-0.5 rounded-md shadow-sm">Playing</span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2">Understanding the recursive nature of DFS and its applications in maze solving and cycle detection.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-start gap-4 hover:border-gray-200 transition-colors group cursor-pointer">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">Lesson 3.2: Breadth-First Search</h4>
                                                <span className="text-xs text-gray-400 font-medium">45 min</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4 opacity-70">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-sm">lock</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-500 text-sm mb-1">Lesson 3.3: Connected Components</h4>
                                                <span className="text-xs text-gray-400 font-medium">30 min</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4 opacity-70">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-sm">lock</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-500 text-sm mb-1">Lesson 3.4: Shortest Paths</h4>
                                                <span className="text-xs text-gray-400 font-medium">55 min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Instructor, Live Shift, Performance, Notes Input */}
                    <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">

                        {/* Instructor */}
                        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Instructor</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <img alt="Prof. Robert Sedgewick" className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6LtHevqr913uhOdNb0ilta-ZIo0SUiold6DL4-UO1Eh5mIxHdfg7Rk5-dV04G6nLHR4Hl5c8HjQJHq4CtTqBoYte5eijy7lusf20zxjsy2CCf_YlDzazeHyu_d9FbUOh4EdH2c-3xkCmEe2GbXPZe5fvMl4Q6G22XTmyBtY8Xh9xb8Pk08jkQsVcGHmlrVd3gvoJhnXZsEt-8OBowp4XdH7hHM3RRJNRDjGjMu-NMdMVIEwbsFPdPPWeoOqD-14oYugvvfqyVQgU" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Prof. R. Sedgewick</h4>
                                    <p className="text-xs text-gray-500">Computer Science Dept.</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Message
                            </button>
                        </div>

                        {/* Live Shift */}
                        <div className="bg-gradient-to-br from-[#5023c4] to-[#3e1a96] rounded-2xl p-6 shadow-deep-purple text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl">videocam</span>
                            </div>
                            <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Upcoming Live Shift</h3>
                            <div className="text-2xl font-bold mb-1">Tuesday</div>
                            <div className="text-primary-light text-sm mb-6">4:00 PM - 5:30 PM EST</div>
                            <button className="w-full py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                Join Live Room
                                <span className="material-symbols-outlined text-[18px]">login</span>
                            </button>
                        </div>

                        {/* Performance */}
                        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Performance</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <span className="material-symbols-outlined text-sm">grade</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Current Grade</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-700">A-</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Attendance</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-700">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes Input Toggle/Trigger */}
                        <div className="bg-white rounded-2xl p-1 shadow-card border border-gray-50 flex items-center">
                            <div className="p-3 text-gray-400">
                                <span className="material-symbols-outlined">edit_note</span>
                            </div>
                            <input
                                className="w-full border-none bg-transparent text-sm placeholder-gray-400 focus:ring-0 p-0 outline-none"
                                placeholder="Type a quick note..."
                                type="text"
                                onClick={() => setNotesOpen(true)}
                            />
                            <button className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Sidebar (Slide-in) */}
            <div className={`fixed top-20 right-4 w-80 bottom-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 transform transition-transform duration-300 flex flex-col ${notesOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)] hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        My Notes
                    </h3>
                    <button onClick={() => setNotesOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-sm text-gray-500 italic text-center mt-10">Start typing to take notes time-stamped to the video...</div>
                </div>
            </div>
        </div>
    );
}
