import React, { useState, useEffect } from 'react';
import { getUsers, getCurrentUser } from '../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        totalCoordinators: 0,
        totalUsers: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [users, user] = await Promise.all([
                getUsers(),
                getCurrentUser()
            ]);

            setCurrentUser(user);

            // Calculate stats
            const students = users.filter(u => u.role?.toLowerCase() === 'student');
            const teachers = users.filter(u => u.role?.toLowerCase() === 'teacher' || u.role?.toLowerCase() === 'instructor');
            const parents = users.filter(u => u.role?.toLowerCase() === 'parent');
            const coordinators = users.filter(u => u.role?.toLowerCase() === 'coordinator');

            setStats({
                totalStudents: students.length,
                totalTeachers: teachers.length,
                totalParents: parents.length,
                totalCoordinators: coordinators.length,
                totalUsers: users.length
            });

            // Get recent users (last 10, sorted by created_at if available)
            const sortedUsers = [...users].sort((a, b) => {
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA;
            }).slice(0, 10);

            setRecentUsers(sortedUsers);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getRoleBadgeColor = (role) => {
        const r = role?.toLowerCase();
        if (r === 'student') return 'bg-blue-50 text-blue-600';
        if (r === 'teacher' || r === 'instructor') return 'bg-purple-50 text-purple-600';
        if (r === 'parent') return 'bg-emerald-50 text-emerald-600';
        if (r === 'coordinator') return 'bg-amber-50 text-amber-600';
        return 'bg-slate-50 text-slate-600';
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Calculate percentages for donut chart
    const studentsPercent = stats.totalUsers > 0 ? Math.round((stats.totalStudents / stats.totalUsers) * 100) : 0;
    const parentsPercent = stats.totalUsers > 0 ? Math.round((stats.totalParents / stats.totalUsers) * 100) : 0;
    const teachersPercent = stats.totalUsers > 0 ? Math.round((stats.totalTeachers / stats.totalUsers) * 100) : 0;
    const othersPercent = 100 - studentsPercent - parentsPercent - teachersPercent;

    // Mock engagement data for bar chart
    const engagementData = [
        { month: 'JAN', height: 40, fill: 80 },
        { month: 'FEB', height: 55, fill: 75 },
        { month: 'MAR', height: 70, fill: 85 },
        { month: 'APR', height: 65, fill: 90 },
        { month: 'MAY', height: 85, fill: 80 },
        { month: 'JUN', height: 95, fill: 95 },
        { month: 'JUL', height: 80, fill: 70 }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-10 py-6 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Institutional Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">Welcome back, {currentUser?.full_name || 'Admin'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 gap-3 text-sm font-medium text-slate-600">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span>Jan 01, 2024 - Dec 31, 2024</span>
                            <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-10 space-y-8">
                {/* Hero Stats Cards */}
                <div className="grid grid-cols-5 gap-6">
                    {/* Total Students */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">school</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-500 flex items-center bg-green-50 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[12px]">trending_up</span> Active
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents.toLocaleString()}</h3>
                    </div>

                    {/* Teaching Staff */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">person_book</span>
                            </div>
                            <span className="text-[10px] font-bold text-primary flex items-center bg-primary-light px-2 py-1 rounded-full">
                                Active
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teaching Staff</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalTeachers}</h3>
                    </div>

                    {/* Verified Parents */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">family_restroom</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{parentsPercent}% of total</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Parents</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalParents.toLocaleString()}</h3>
                    </div>

                    {/* Coordinators */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Admin</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coordinators</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalCoordinators}</h3>
                    </div>

                    {/* Institutional Score */}
                    <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 border border-primary/20 hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 bg-white/20 text-white rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">star_half</span>
                            </div>
                            <span className="material-symbols-outlined text-white text-[16px]">verified</span>
                        </div>
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Platform Health</p>
                        <h3 className="text-2xl font-black text-white mt-1">98<span className="text-sm font-normal text-white/60">%</span></h3>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-3 gap-8">
                    {/* Stakeholder Distribution */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 col-span-1">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-slate-900">Stakeholder Distribution</h4>
                            <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
                        </div>
                        <div className="relative size-56 mx-auto mb-8">
                            <svg className="transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="12"></circle>
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#5023c4" strokeDasharray={`${studentsPercent * 2.51} 251`} strokeWidth="12"></circle>
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#8b5cf6" strokeDasharray={`${parentsPercent * 2.51} 251`} strokeDashoffset={`-${studentsPercent * 2.51}`} strokeWidth="12"></circle>
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#c084fc" strokeDasharray={`${teachersPercent * 2.51} 251`} strokeDashoffset={`-${(studentsPercent + parentsPercent) * 2.51}`} strokeWidth="12"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{(stats.totalUsers / 1000).toFixed(1)}k</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                <span className="text-xs text-slate-600 font-medium">Students ({studentsPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-[#8b5cf6]"></span>
                                <span className="text-xs text-slate-600 font-medium">Parents ({parentsPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-[#c084fc]"></span>
                                <span className="text-xs text-slate-600 font-medium">Teachers ({teachersPercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-slate-200"></span>
                                <span className="text-xs text-slate-600 font-medium">Others ({othersPercent}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Engagement */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="font-bold text-slate-900">Platform Engagement (MAU)</h4>
                                <p className="text-xs text-slate-400 font-medium">Tracking monthly active users across all roles</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200 uppercase">Weekly</button>
                                <button className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-md uppercase">Monthly</button>
                            </div>
                        </div>
                        <div className="h-64 relative flex items-end justify-between px-2 pt-4">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="border-t border-slate-900 h-px w-full"></div>
                                ))}
                            </div>
                            {engagementData.map((data, index) => (
                                <div key={index} className="w-12 bg-primary-light rounded-t-lg relative group" style={{ height: `${data.height}%` }}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-300" style={{ height: `${data.fill}%` }}></div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Registrations & Alerts */}
                <div className="grid grid-cols-3 gap-8">
                    {/* Recent Registrations */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 col-span-2 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">Recent Registrations</h4>
                            <button className="text-xs font-bold text-primary hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentUsers.slice(0, 5).map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {getInitials(user.full_name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                                                        <p className="text-[10px] text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-md capitalize ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{getTimeAgo(user.created_at)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status?.toLowerCase() === 'active' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                    <span className={`size-1.5 rounded-full ${user.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                                                    {user.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-primary/5 flex flex-col">
                        <div className="p-6 border-b border-slate-50">
                            <h4 className="font-bold text-slate-900">System Alerts</h4>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[300px]">
                            <div className="flex gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-900">All Systems Operational</p>
                                    <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">Platform is running smoothly with {stats.totalUsers} active users.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">info</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-900">{stats.totalStudents} Students Enrolled</p>
                                    <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">Growing student community across all programs.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="size-8 rounded-full bg-slate-200 text-slate-600 flex-shrink-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">update</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Database Backup Success</p>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Scheduled full system backup completed successfully.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
