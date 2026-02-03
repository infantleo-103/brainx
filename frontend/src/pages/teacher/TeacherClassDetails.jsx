import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function TeacherClassDetails() {
    const { courseId } = useParams();

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500 hover:text-primary">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <Link to="/teacher/classes" className="text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 font-serif">Advanced Algorithms</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Search class data..." type="text" />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <img alt="User" className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 bg-background-light">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class Attendance</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">94%</h3>
                                <span className="text-green-500 text-xs font-bold flex items-center"><span
                                    className="material-symbols-outlined text-sm">trending_up</span> +2%</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Average Quiz Score</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">82%</h3>
                                <span className="text-primary text-xs font-bold">In-range</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assignments Pending</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">15</h3>
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Action
                                    Required</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resource Engagement</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">High</h3>
                                <span className="text-gray-400 text-xs font-medium">Top 10% of courses</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">folder_open</span>
                                        Resource Library
                                    </h2>
                                    <button
                                        className="px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                        Upload New
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                                <span className="material-symbols-outlined">picture_as_pdf</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Lecture-04-Sorting.pdf</p>
                                                <p className="text-xs text-gray-500">2.4 MB • Oct 12, 2023</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Visible</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
                                                    </div>
                                                </label>
                                            </div>
                                            <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined">movie</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Big_O_Notation_Deep_Dive.mp4</p>
                                                <p className="text-xs text-gray-500">156 MB • Oct 10, 2023</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Visible</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
                                                    </div>
                                                </label>
                                            </div>
                                            <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined">present_to_all</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Midterm_Review_Slides.pptx</p>
                                                <p className="text-xs text-gray-500">8.1 MB • Oct 08, 2023</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Visible</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input className="sr-only peer" type="checkbox" />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
                                                    </div>
                                                </label>
                                            </div>
                                            <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">assessment</span>
                                        Assessment Tracker
                                    </h2>
                                    <button className="text-sm font-bold text-primary hover:underline">View All Submissions</button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Quiz 02: Dynamic Programming</h4>
                                            <p className="text-xs text-gray-500 mt-1">Due: Oct 20, 2023</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">38/42</span>
                                                <span className="text-xs text-gray-400">Submitted</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-primary w-[90%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Lab Assignment: Graph Theory</h4>
                                            <p className="text-xs text-gray-500 mt-1">Due: Oct 25, 2023</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">12/42</span>
                                                <span className="text-xs text-gray-400">Submitted</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-amber-500 w-[30%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="space-y-8">
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 bg-primary text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Next Session</span>
                                        <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">14:00 PM</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-6">Live Virtual Classroom</h3>
                                    <button className="w-full py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4">
                                        <span className="material-symbols-outlined">video_call</span>
                                        Start Live Class
                                    </button>
                                    <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase opacity-70">Meeting Link</span>
                                            <span className="text-xs font-medium truncate max-w-[150px]">zoom.us/j/88273...</span>
                                        </div>
                                        <Link to={`/teacher/classes/${courseId}/meeting`} className="text-xs font-bold underline hover:opacity-80">Manage Link</Link>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                                        Recent Activity
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex gap-4 relative">
                                        <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gray-100"></div>
                                        <img alt="" className="w-8 h-8 rounded-full border border-white relative z-10"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Marcus Chen</p>
                                            <p className="text-xs text-gray-500">Submitted <span className="text-primary font-medium">Lab Assignment</span></p>
                                            <p className="text-[10px] text-gray-400 mt-1">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative">
                                        <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gray-100"></div>
                                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary relative z-10">
                                            <span className="material-symbols-outlined text-sm">forum</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">New Forum Post</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">"Hey Professor, I have a question about Dijkstra's..."</p>
                                            <p className="text-[10px] text-gray-400 mt-1">15 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <img alt="" className="w-8 h-8 rounded-full border border-white relative z-10"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Elena Rodriguez</p>
                                            <p className="text-xs text-gray-500">Submitted <span className="text-primary font-medium">Quiz 02</span></p>
                                            <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden mb-10 shadow-card">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 font-serif">Student Performance Roster</h2>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Top Performing</span>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Needs Attention</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-50">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <img alt="" className="w-10 h-10 rounded-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Marcus Chen</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase">A+ (98.2%)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Exceptional participation in forums and perfect scores on all quizzes.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <img alt="" className="w-10 h-10 rounded-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Sarah Jenkins</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase">A (94.5%)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Consistently high-quality lab submissions. Strong analytical skills.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Leo Thompson</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase">C- (71.2%)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Missed last two live sessions. Engagement with materials has dropped.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Jessica Wu</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase">D (64.8%)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Struggling with Dynamic Programming concepts. Recommended for tutoring.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
