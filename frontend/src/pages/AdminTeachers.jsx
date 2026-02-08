import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, signup, getBatches, addBatchMember, getUserProfile, getTeacherAvailability, updateTeacherAvailability } from '../services/api';

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTeacher, setDetailTeacher] = useState(null);
    const [teacherBatches, setTeacherBatches] = useState([]);
    
    // Teacher Availability State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [availabilityData, setAvailabilityData] = useState({
        weekday_available: false,
        weekday_start: '09:00',
        weekday_end: '17:00',
        weekend_available: false,
        weekend_start: '10:00',
        weekend_end: '14:00'
    });
    const [savingAvailability, setSavingAvailability] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const [allUsers, allBatches] = await Promise.all([
                getUsers(),
                getBatches(0, 1000)
            ]);
            
            const teacherList = allUsers.filter(u => u.role?.toLowerCase() === 'teacher');
            
            // Enrich teachers with batch/course information
            const enrichedTeachers = teacherList.map(teacher => {
                const teacherBatches = allBatches.filter(b => b.teacher_id === teacher.id);
                const uniqueCourses = [...new Set(teacherBatches.map(b => b.course?.title).filter(Boolean))];
                
                return {
                    ...teacher,
                    courseNames: uniqueCourses,
                    classCount: teacherBatches.length
                };
            });
            
            setTeachers(enrichedTeachers);
            
            const activeCount = enrichedTeachers.filter(t => t.status === 'active' || t.status === true).length;
            setStats({ total: enrichedTeachers.length, active: activeCount });
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusToggle = async (teacher) => {
        try {
            const currentStatus = teacher.status === 'active' || teacher.status === true;
            const newStatus = currentStatus ? 'disabled' : 'active';
            
            await updateUser(teacher.id, { status: newStatus });
            
            setTeachers(prev => prev.map(t => 
                t.id === teacher.id ? { ...t, status: newStatus } : t
            ));
            
            setStats(prev => ({
                ...prev,
                active: newStatus === 'active' ? prev.active + 1 : prev.active - 1
            }));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (teacherId) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;
        try {
            await deleteUser(teacherId);
            const deletedTeacher = teachers.find(t => t.id === teacherId);
            setTeachers(prev => prev.filter(t => t.id !== teacherId));
            setStats(prev => ({
                total: prev.total - 1,
                active: prev.active - (deletedTeacher?.status === 'active' ? 1 : 0)
            }));
        } catch (error) {
            console.error("Failed to delete teacher:", error);
            alert("Failed to delete teacher");
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await signup({
                ...formData,
                role: 'teacher',
                status: 'active'
            });
            
            // Reset form and close modal
            setFormData({ full_name: '', email: '', phone: '', password: '' });
            setShowCreateModal(false);
            
            // Refresh teachers list
            fetchTeachers();
            alert("Teacher created successfully!");
        } catch (error) {
            console.error("Failed to create teacher:", error);
            alert(error.message || "Failed to create teacher");
        } finally {
            setIsCreating(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAssignClass = (teacher) => {
        setSelectedTeacher(teacher);
        setShowAssignModal(true);
        fetchBatches();
    };

    const fetchBatches = async () => {
        try {
            const batchesData = await getBatches();
            setBatches(batchesData.data || []);
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        if (!selectedBatchId || !selectedTeacher) return;

        try {
            await addBatchMember(selectedBatchId, {
                batch_id: selectedBatchId,
                user_id: selectedTeacher.id,
                role: 'teacher',
                status: 'active'
            });

            alert(`${selectedTeacher.full_name} assigned to class successfully!`);
            setShowAssignModal(false);
            setSelectedBatchId('');
        } catch (error) {
            console.error("Failed to assign class:", error);
            alert(error.message || "Failed to assign class");
        }
    };

    const handleViewDetails = async (teacher) => {
        setDetailTeacher(teacher);
        setShowDetailModal(true);
        
        // Fetch comprehensive user profile data
        try {
            const profileData = await getUserProfile(teacher.id);
            const roleData = profileData.role_data || {};
            setTeacherBatches(roleData.batches || []);
            
            // Update teacher with fresh stats
            setDetailTeacher({
                ...teacher,
                classCount: roleData.total_batches || 0,
                courseNames: [...new Set((roleData.batches || []).map(b => b.course?.title).filter(Boolean))]
            });
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setTeacherBatches([]);
        }
    };

    // Teacher Availability Handlers
    const handleManageSchedule = async (teacher) => {
        setSelectedTeacher(teacher);
        setShowScheduleModal(true);
        
        // Fetch existing availability
        try {
            const existing = await getTeacherAvailability(teacher.id);
            setAvailabilityData({
                weekday_available: existing.weekday_available || false,
                weekday_start: existing.weekday_start?.substring(0, 5) || '09:00',
                weekday_end: existing.weekday_end?.substring(0, 5) || '17:00',
                weekend_available: existing.weekend_available || false,
                weekend_start: existing.weekend_start?.substring(0, 5) || '10:00',
                weekend_end: existing.weekend_end?.substring(0, 5) || '14:00'
            });
        } catch (error) {
            // No existing availability, use defaults
            setAvailabilityData({
                weekday_available: false,
                weekday_start: '09:00',
                weekday_end: '17:00',
                weekend_available: false,
                weekend_start: '10:00',
                weekend_end: '14:00'
            });
        }
    };

    const handleSaveAvailability = async () => {
        if (!selectedTeacher) return;
        
        setSavingAvailability(true);
        try {
            await updateTeacherAvailability(selectedTeacher.id, availabilityData);
            alert("Availability saved successfully!");
            setShowScheduleModal(false);
        } catch (error) {
            console.error("Failed to save availability:", error);
            alert("Failed to save availability. " + (error.message || ""));
        } finally {
            setSavingAvailability(false);
        }
    };

    return (
        <div className="flex-1">
            <header className="h-24 bg-white/80 backdrop-blur-md sticky top-0 border-b border-border-subtle px-10 flex items-center justify-between z-40">
                <h1 className="text-2xl font-bold text-[#1a1625]">Teacher Management</h1>
                <div className="flex items-center gap-6">
                    <div className="relative w-96 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            className="w-full pl-12 pr-4 h-11 bg-gray-50 border-gray-100 rounded-full text-sm focus:ring-primary focus:border-primary transition-all" 
                            placeholder="Search by name, ID or department..." 
                            type="text" 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary text-white h-11 px-6 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:bg-[#3e1a96] transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Add New Teacher
                    </button>
                </div>
            </header>
            <div className="p-10">
                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-6 rounded-card shadow-soft-purple border border-white flex items-center gap-5">
                        <div className="size-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">diversity_3</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Faculty</p>
                            <h4 className="text-2xl font-extrabold">{stats.total}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-card shadow-soft-purple border border-white flex items-center gap-5">
                        <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Active Instructors</p>
                            <h4 className="text-2xl font-extrabold">{stats.active}</h4>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-card shadow-soft-purple border border-white overflow-hidden">
                    <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                        <h3 className="font-bold text-lg">Staff Directory</h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                                    <th className="px-8 py-4">Instructor</th>
                                    <th className="px-6 py-4">Teacher ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Classes</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">Loading teachers...</td>
                                    </tr>
                                ) : filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">No teachers found.</td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map(teacher => {
                                        const isActive = teacher.status === 'active' || teacher.status === true;
                                        return (
                                            <tr key={teacher.id} className="hover:bg-primary-light/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-11 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                                            <img 
                                                                alt={teacher.full_name} 
                                                                className="w-full h-full object-cover" 
                                                                src={teacher.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.full_name)}&background=random`} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-[#1a1625]">{teacher.full_name}</p>
                                                            <p className="text-xs text-gray-400">{teacher.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-xs font-semibold text-gray-500 px-2 py-1 bg-gray-100 rounded" title={teacher.id}>
                                                        {teacher.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button 
                                                        onClick={() => handleStatusToggle(teacher)}
                                                        className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase transition-all ${
                                                            isActive 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-gray-400 text-[18px]">school</span>
                                                        <span className="text-sm font-bold">{teacher.classCount || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleAssignClass(teacher)}
                                                            className="text-xs font-bold text-primary hover:underline px-2 py-1"
                                                        >
                                                            Assign Class
                                                        </button>
                                                        <button 
                                                            onClick={() => handleManageSchedule(teacher)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center gap-1"
                                                            title="Manage Availability"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                            Schedule
                                                        </button>
                                                        <button 
                                                            onClick={() => handleViewDetails(teacher)}
                                                            className="text-xs font-bold text-gray-600 hover:text-primary transition-colors border border-gray-200 hover:border-primary/30 px-3 py-1.5 rounded-lg bg-white"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(teacher.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete Teacher"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 border-t border-border-subtle flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-bold">{filteredTeachers.length}</span> of <span className="font-bold">{stats.total}</span> teachers
                        </p>
                    </div>
                </div>
            </div>

            {/* Create Teacher Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#1a1625]">Add New Teacher</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTeacher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="teacher@example.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Phone number"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-[#3e1a96] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Class Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#1a1625]">Assign to Class</h2>
                            <button 
                                onClick={() => setShowAssignModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        
                        {selectedTeacher && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Teacher</p>
                                <p className="font-bold text-[#1a1625]">{selectedTeacher.full_name}</p>
                                <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmitAssignment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class</label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="">Choose a class...</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.batch_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-[#3e1a96] transition-all"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Teacher Detail Modal */}
            {showDetailModal && detailTeacher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#1a1625]">Teacher Details</h2>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Section */}
                            <div className="bg-gradient-to-br from-primary/5 to-purple-50 p-6 rounded-xl">
                                <div className="flex items-start gap-6">
                                    <div className="size-24 rounded-2xl overflow-hidden bg-gray-100 shadow-lg shrink-0">
                                        <img 
                                            alt={detailTeacher.full_name} 
                                            className="w-full h-full object-cover" 
                                            src={detailTeacher.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailTeacher.full_name)}&background=random&size=200`} 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-[#1a1625] mb-2">{detailTeacher.full_name}</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="material-symbols-outlined text-sm">mail</span>
                                                <span className="text-sm">{detailTeacher.email}</span>
                                            </div>
                                            {detailTeacher.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span className="material-symbols-outlined text-sm">phone</span>
                                                    <span className="text-sm">{detailTeacher.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-gray-600">badge</span>
                                                <span className="font-mono text-xs font-semibold text-gray-500 px-2 py-1 bg-white rounded">
                                                    {detailTeacher.id.substring(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-4 py-2 text-xs font-bold rounded-full uppercase ${
                                            (detailTeacher.status === 'active' || detailTeacher.status === true)
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                            {(detailTeacher.status === 'active' || detailTeacher.status === true) ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-blue-600">school</span>
                                        <span className="text-xs font-bold text-blue-600 uppercase">Classes</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[#1a1625]">{detailTeacher.classCount || 0}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-purple-600">book_2</span>
                                        <span className="text-xs font-bold text-purple-600 uppercase">Courses</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[#1a1625]">{detailTeacher.courseNames?.length || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-green-600">groups</span>
                                        <span className="text-xs font-bold text-green-600 uppercase">Students</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[#1a1625]">
                                        {teacherBatches.reduce((sum, batch) => sum + (batch.members?.length || 0), 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Courses Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1a1625] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">book_2</span>
                                    Assigned Courses
                                </h3>
                                {detailTeacher.courseNames && detailTeacher.courseNames.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {detailTeacher.courseNames.map((course, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100">
                                                {course}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No courses assigned yet</p>
                                )}
                            </div>

                            {/* Classes Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1a1625] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">school</span>
                                    Teaching Classes ({teacherBatches.length})
                                </h3>
                                {teacherBatches.length > 0 ? (
                                    <div className="space-y-3">
                                        {teacherBatches.map(batch => (
                                            <div key={batch.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-[#1a1625]">{batch.batch_name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{batch.course?.title || 'No course'}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                        batch.status ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {batch.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-xs text-gray-500">Students</span>
                                                        <p className="font-semibold text-[#1a1625]">{batch.members?.length || 0}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Duration</span>
                                                        <p className="font-semibold text-[#1a1625]">{batch.total_hours || 0}h</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Schedule</span>
                                                        <p className="font-semibold text-[#1a1625]">{batch.schedule_time || 'TBD'}</p>
                                                    </div>
                                                </div>
                                                {batch.start_date && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
                                                        <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                                                        {batch.end_date && (
                                                            <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No classes assigned yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Availability Modal */}
            {showScheduleModal && selectedTeacher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowScheduleModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1a1625] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">schedule</span>
                                        Set Availability
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-bold text-blue-600">{selectedTeacher.full_name}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowScheduleModal(false)}
                                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Weekday Availability */}
                            <div className={`p-5 rounded-xl border-2 transition-all ${
                                availabilityData.weekday_available 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${
                                            availabilityData.weekday_available ? 'bg-green-100' : 'bg-gray-200'
                                        }`}>
                                            <span className="material-symbols-outlined text-green-600">work</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Weekdays</h4>
                                            <p className="text-xs text-gray-500">Monday - Friday</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={availabilityData.weekday_available}
                                            onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekday_available: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                
                                {availabilityData.weekday_available && (
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-200">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={availabilityData.weekday_start}
                                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekday_start: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-lg border border-green-200 bg-white text-sm font-medium focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={availabilityData.weekday_end}
                                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekday_end: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-lg border border-green-200 bg-white text-sm font-medium focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Weekend Availability */}
                            <div className={`p-5 rounded-xl border-2 transition-all ${
                                availabilityData.weekend_available 
                                    ? 'bg-purple-50 border-purple-200' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${
                                            availabilityData.weekend_available ? 'bg-purple-100' : 'bg-gray-200'
                                        }`}>
                                            <span className="material-symbols-outlined text-purple-600">weekend</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Weekends</h4>
                                            <p className="text-xs text-gray-500">Saturday - Sunday</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={availabilityData.weekend_available}
                                            onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekend_available: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                    </label>
                                </div>
                                
                                {availabilityData.weekend_available && (
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-purple-200">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={availabilityData.weekend_start}
                                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekend_start: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-lg border border-purple-200 bg-white text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={availabilityData.weekend_end}
                                                onChange={(e) => setAvailabilityData(prev => ({ ...prev, weekend_end: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-lg border border-purple-200 bg-white text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveAvailability}
                                disabled={savingAvailability}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                            >
                                {savingAvailability ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Save Availability
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
