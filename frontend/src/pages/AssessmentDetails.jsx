import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import assessmentsService from '../services/assessments';
import { getBatchMembers } from '../services/api';

export default function AssessmentDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [assessment, setAssessment] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Assessment Details
                const assessmentData = await assessmentsService.getAssessmentById(id);
                setAssessment(assessmentData);

                // 2. Fetch Batch Members (Students)
                if (assessmentData.batch_id) {
                    const membersData = await getBatchMembers(assessmentData.batch_id);
                    // Filter for students only? Assuming API returns all members.
                    // Assuming membersData is list of { user: { name, ... }, role: ... }
                    // Adjust based on actual API response structure for /classes/{id}/members
                    // For now, mapping directly assuming a simple list or handling standard response
                    const membersList = Array.isArray(membersData) ? membersData : (membersData.data || []);
                    setStudents(membersList);
                }
            } catch (error) {
                console.error("Failed to fetch assessment details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!assessment) return <div className="p-8 text-center">Assessment not found.</div>;

    // Helper to extract initials
    const getInitials = (name) => {
        return name ? name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase() : '??';
    };

    return (
        <div className="h-full overflow-y-auto scroll-smooth p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto w-full space-y-6">
                <div className="flex flex-col gap-4">
                    <nav className="flex text-sm text-slate-500 dark:text-slate-400">
                        <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/assessment')}>Assessments</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white font-medium">{assessment.title}</span>
                    </nav>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{assessment.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400">{assessment.course_name} • {assessment.batch_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/assessment')}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                <span>Back to Overview</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stat Cards - Placeholder/Calculated from real data if available later */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">group</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{students.length}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitted</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">0</span>
                            <span className="text-xs text-slate-500">Not implemented</span>
                        </div>
                    </div>
                    {/* More stats can be added here */}
                </div>

                <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                placeholder="Search student name..." type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors text-sm font-medium">
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Student Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                                    <th className="px-6 py-4 text-center whitespace-nowrap">Score</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No students found in this batch.</td>
                                    </tr>
                                )}
                                {students.filter(s => s.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300`}>
                                                    {getInitials(student.user.full_name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{student.user.full_name}</span>
                                                    <span className="text-xs text-slate-500">{student.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">Pending</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">- / {assessment.total_marks}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
