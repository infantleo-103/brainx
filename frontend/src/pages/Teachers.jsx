import React, { useState, useEffect } from 'react';
import { getUsers, getCourses, assignTeacherToCourse, getTeacherCourses, removeTeacherFromCourse, deleteUser, updateUser, createBulkTimeSlots, getTeacherTimeSlots, deleteTimeSlot } from '../services/api';

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [assigning, setAssigning] = useState(false);
    
    // Time Slot Management State
    const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
    const [teacherSlots, setTeacherSlots] = useState([]);
    const [slotFormData, setSlotFormData] = useState({
        dates: [],
        startTime: '09:00',
        endTime: '17:00'
    });
    const [creatingSlots, setCreatingSlots] = useState(false);

    useEffect(() => {
        fetchTeachers();
        fetchCourses();
    }, []);

    const fetchTeachers = async () => {
        try {
            const allUsers = await getUsers();
            // Filter for teachers
            const teacherList = allUsers.filter(u => u.role?.toLowerCase() === 'teacher');
            setTeachers(teacherList);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const courseList = await getCourses();
            setCourses(courseList);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const handleManageCourses = async (teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignModalOpen(true);
        fetchTeacherCourses(teacher.id);
    };

    const fetchTeacherCourses = async (teacherId) => {
        try {
            const data = await getTeacherCourses(teacherId);
            setAssignedCourses(data);
        } catch (error) {
            console.error("Failed to fetch assigned courses:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedCourseId || !selectedTeacher) return;
        setAssigning(true);
        try {
            await assignTeacherToCourse(selectedTeacher.id, parseInt(selectedCourseId));
            await fetchTeacherCourses(selectedTeacher.id); // Refresh list
            setSelectedCourseId('');
        } catch (error) {
            console.error("Failed to assign course:", error);
            alert("Failed to assign course. It might already be assigned.");
        } finally {
            setAssigning(false);
        }
    };

    const handleRemove = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to unassign this course?")) return;
        try {
            await removeTeacherFromCourse(assignmentId);
            fetchTeacherCourses(selectedTeacher.id);
        } catch (error) {
            console.error("Failed to unassign course:", error);
        }
    };

    const handleDeleteTeacher = async (teacherId) => {
        if (!window.confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) return;
        try {
            await deleteUser(teacherId);
            setTeachers(teachers.filter(t => t.id !== teacherId));
        } catch (error) {
            console.error("Failed to delete teacher:", error);
            alert("Failed to delete teacher.");
        }
    };

    const handleStatusToggle = async (teacher) => {
        try {
            const newStatus = !teacher.status;
            await updateUser(teacher.id, { status: newStatus });
            setTeachers(teachers.map(t => t.id === teacher.id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status.");
        }
    };

    // Time Slot Management Handlers
    const handleManageTimeSlots = async (teacher) => {
        setSelectedTeacher(teacher);
        setIsTimeSlotModalOpen(true);
        fetchTeacherTimeSlots(teacher.id);
        // Reset form
        setSlotFormData({
            dates: [],
            startTime: '09:00',
            endTime: '17:00'
        });
    };

    const fetchTeacherTimeSlots = async (teacherId) => {
        try {
            const slots = await getTeacherTimeSlots(teacherId);
            setTeacherSlots(slots);
        } catch (error) {
            console.error("Failed to fetch time slots:", error);
        }
    };

    const handleCreateTimeSlots = async () => {
        if (!selectedTeacher || slotFormData.dates.length === 0) {
            alert("Please select at least one date");
            return;
        }

        setCreatingSlots(true);
        try {
            const payload = {
                teacher_id: selectedTeacher.id,
                slot_dates: slotFormData.dates,
                start_time: slotFormData.startTime,
                end_time: slotFormData.endTime
            };
            
            await createBulkTimeSlots(payload);
            await fetchTeacherTimeSlots(selectedTeacher.id);
            
            // Reset form
            setSlotFormData({
                dates: [],
                startTime: '09:00',
                endTime: '17:00'
            });
            
            alert("Time slots created successfully!");
        } catch (error) {
            console.error("Failed to create time slots:", error);
            alert("Failed to create time slots. " + (error.message || ""));
        } finally {
            setCreatingSlots(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Delete this time slot?")) return;
        
        try {
            await deleteTimeSlot(slotId);
            await fetchTeacherTimeSlots(selectedTeacher.id);
        } catch (error) {
            console.error("Failed to delete slot:", error);
            alert("Failed to delete slot.");
        }
    };

    const handleDateToggle = (date) => {
        setSlotFormData(prev => {
            const dates = prev.dates.includes(date)
                ? prev.dates.filter(d => d !== date)
                : [...prev.dates, date];
            return { ...prev, dates };
        });
    };

    // Generate next 7 days for date picker
    const getNextDays = (count = 7) => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    // Derived Stats
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status).length;
    const inactiveTeachers = totalTeachers - activeTeachers;

    const StatsCard = ({ title, value, icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-[#120f1a]">{value}</h3>
            </div>
        </div>
    );

    if (loading) return <div className="p-10 text-center text-slate-400">Loading dashboard...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto font-display space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#120f1a] mb-2">Teacher Dashboard</h1>
                <p className="text-slate-500">Manage your teaching staff, assignments, and performance.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Total Teachers" 
                    value={totalTeachers} 
                    icon="group" 
                    color="bg-blue-500" 
                />
                <StatsCard 
                    title="Active Staff" 
                    value={activeTeachers} 
                    icon="check_circle" 
                    color="bg-emerald-500" 
                />
                <StatsCard 
                    title="Inactive / Pending" 
                    value={inactiveTeachers} 
                    icon="pending" 
                    color="bg-amber-500" 
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-[#120f1a]">All Teachers</h2>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input 
                            type="text" 
                            placeholder="Search teachers..." 
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Teacher</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No teachers found.
                                    </td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                    {teacher.full_name?.[0] || 'T'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#120f1a] text-sm">{teacher.full_name}</div>
                                                    <div className="text-xs text-slate-400">ID: {teacher.id.substring(0,8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 text-sm">{teacher.email}</span>
                                                <span className="text-slate-400 text-xs">{teacher.phone || 'No phone'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(teacher.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleStatusToggle(teacher)}
                                                className={`group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                    teacher.status 
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                                                }`}
                                            >
                                                <span className={`size-1.5 rounded-full ${teacher.status ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {teacher.status ? 'Active' : 'Inactive'}
                                                <span className="hidden group-hover:inline ml-1 text-[10px] opacity-70">Toggle</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleManageCourses(teacher)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">school</span>
                                                    Assign
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleManageTimeSlots(teacher)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                                    title="Manage Time Slots"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                    Schedule
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                                    className="inline-flex items-center justify-center size-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Delete Teacher"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-center">
                    Showing {teachers.length} teachers
                </div>
            </div>

            {/* Manage Courses Modal */}
            {isAssignModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-white/20">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-[#120f1a]">Course Assignments</h3>
                                <p className="text-sm text-slate-500 mt-1">Manage courses for <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{selectedTeacher.full_name}</span></p>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto">
                            {/* Assigner */}
                            <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Assign New Course</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select 
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            className="block w-full rounded-xl border-slate-200 bg-white text-[#120f1a] shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 pl-4 pr-10 appearance-none font-medium text-sm outline-none transition-all"
                                        >
                                            <option value="">Select a course...</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAssign}
                                        disabled={!selectedCourseId || assigning}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        {assigning ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">add_circle</span>}
                                        Assign
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-slate-700">Active Assignments</label>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{assignedCourses.length}</span>
                                </div>
                                
                                {assignedCourses.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-100">
                                        <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-slate-300 text-3xl">school</span>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm">No courses assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {assignedCourses.map((assignment) => {
                                            const courseDetails = courses.find(c => c.id === assignment.course_id);
                                            return (
                                                <div key={assignment.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <img 
                                                            src={courseDetails?.image || 'https://via.placeholder.com/40'} 
                                                            alt="" 
                                                            className="size-12 rounded-xl object-cover bg-slate-100"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-[#120f1a] text-sm mb-0.5">{courseDetails?.title || `Course ID: ${assignment.course_id}`}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{courseDetails?.level || 'Coure'}</span>
                                                                <span className="text-[10px] text-slate-400">ID: {assignment.course_id}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemove(assignment.id)}
                                                        className="size-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                        title="Unassign Course"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Slot Management Modal */}
            {isTimeSlotModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="font-bold text-xl text-[#120f1a] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">schedule</span>
                                    Time Slot Management
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage availability for <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{selectedTeacher.full_name}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsTimeSlotModalOpen(false)} 
                                className="text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto">
                            {/* Create Slots Section */}
                            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    Create New Time Slots
                                </h4>
                                
                                {/* Date Selection */}
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Select Dates</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {getNextDays(14).map(date => {
                                            const dateObj = new Date(date);
                                            const isSelected = slotFormData.dates.includes(date);
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => handleDateToggle(date)}
                                                    className={`p-2 rounded-lg text-xs font-bold transition-all ${
                                                        isSelected 
                                                        ? 'bg-blue-600 text-white shadow-md' 
                                                        : 'bg-white text-slate-600 hover:bg-blue-100 border border-slate-200'
                                                    }`}
                                                >
                                                    <div className="text-[10px] opacity-70">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    <div>{dateObj.getDate()}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {slotFormData.dates.length > 0 && (
                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                            {slotFormData.dates.length} date{slotFormData.dates.length > 1 ? 's' : ''} selected
                                        </p>
                                    )}
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={slotFormData.startTime}
                                            onChange={(e) => setSlotFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={slotFormData.endTime}
                                            onChange={(e) => setSlotFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-100 border border-blue-200 rounded-xl p-3 mb-4">
                                    <p className="text-xs text-blue-700 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                        <span>
                                            Slots will be created in <strong>1-hour intervals</strong>. 
                                            Example: 08:00-12:00 creates 4 slots: 08-09, 09-10, 10-11, 11-12
                                        </span>
                                    </p>
                                </div>

                                {/* Create Button */}
                                <button
                                    onClick={handleCreateTimeSlots}
                                    disabled={creatingSlots || slotFormData.dates.length === 0}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    {creatingSlots ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">add_circle</span>
                                            Create Time Slots
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Existing Slots List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500">event_available</span>
                                        Existing Time Slots
                                    </h4>
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                                        {teacherSlots.length} slots
                                    </span>
                                </div>
                                
                                {teacherSlots.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                        <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-slate-300 text-3xl">event_busy</span>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm">No time slots created yet.</p>
                                        <p className="text-slate-400 text-xs mt-1">Create your first slot above</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {/* Group slots by date */}
                                        {Object.entries(
                                            teacherSlots.reduce((acc, slot) => {
                                                const date = slot.slot_date;
                                                if (!acc[date]) acc[date] = [];
                                                acc[date].push(slot);
                                                return acc;
                                            }, {})
                                        ).map(([date, slots]) => (
                                            <div key={date} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                                                    <p className="text-xs font-bold text-slate-600">
                                                        {new Date(date).toLocaleDateString('en-US', { 
                                                            weekday: 'long', 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {slots.sort((a, b) => a.slot_start.localeCompare(b.slot_start)).map(slot => (
                                                        <div 
                                                            key={slot.id} 
                                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-10 rounded-lg flex items-center justify-center ${
                                                                    slot.status === 'available' ? 'bg-green-50 text-green-600' :
                                                                    slot.status === 'booked' ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    <span className="material-symbols-outlined text-lg">
                                                                        {slot.status === 'available' ? 'check_circle' : 
                                                                         slot.status === 'booked' ? 'event_available' : 'block'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-slate-700">
                                                                        {slot.slot_start.substring(0, 5)} - {slot.slot_end.substring(0, 5)}
                                                                    </p>
                                                                    <p className={`text-xs font-medium ${
                                                                        slot.status === 'available' ? 'text-green-600' :
                                                                        slot.status === 'booked' ? 'text-blue-600' :
                                                                        'text-slate-500'
                                                                    }`}>
                                                                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {slot.status === 'available' && (
                                                                <button
                                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                                    className="size-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Delete Slot"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
