import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, signup, getUserProfile, linkParentStudent, unlinkParentStudent } from '../services/api';

export default function AdminParents() {
    const [parents, setParents] = useState([]);
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
    const [showLinkChildModal, setShowLinkChildModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailParent, setDetailParent] = useState(null);
    const [parentChildren, setParentChildren] = useState([]);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const allUsers = await getUsers();
            
            const parentList = allUsers.filter(u => u.role?.toLowerCase() === 'parent');
            
            setParents(parentList);
            
            const activeCount = parentList.filter(p => p.status?.toLowerCase() === 'active').length;
            setStats({
                total: parentList.length,
                active: activeCount
            });
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const allUsers = await getUsers();
            const students = allUsers.filter(u => u.role?.toLowerCase() === 'student');
            setAvailableStudents(students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const handleCreateParent = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            await signup({
                ...formData,
                role: 'parent',
                status: 'active'
            });

            setShowCreateModal(false);
            setFormData({ full_name: '', email: '', phone: '', password: '' });
            fetchParents();
        } catch (error) {
            console.error('Failed to create parent:', error);
            alert('Failed to create parent. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleStatusToggle = async (parent) => {
        try {
            const newStatus = parent.status?.toLowerCase() === 'active' ? 'disabled' : 'active';
            await updateUser(parent.id, { status: newStatus });
            fetchParents();
        } catch (error) {
            console.error('Failed to update parent status:', error);
        }
    };

    const handleDelete = async (parentId) => {
        if (!window.confirm('Are you sure you want to delete this parent?')) return;

        try {
            await deleteUser(parentId);
            fetchParents();
        } catch (error) {
            console.error('Failed to delete parent:', error);
        }
    };

    const handleLinkChild = (parent) => {
        setSelectedParent(parent);
        setShowLinkChildModal(true);
        fetchAllStudents();
    };

    const handleSubmitLinkChild = async (e) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        try {
            await linkParentStudent(selectedParent.id, selectedStudentId);
            setShowLinkChildModal(false);
            setSelectedStudentId('');
            setStudentSearch('');
            alert('Child linked successfully!');
        } catch (error) {
            console.error('Failed to link child:', error);
            alert('Failed to link child. They may already be linked.');
        }
    };

    const handleViewDetails = async (parent) => {
        setDetailParent(parent);
        setShowDetailModal(true);
        
        // Fetch comprehensive parent profile data
        try {
            const profileData = await getUserProfile(parent.id);
            const roleData = profileData.role_data || {};
            setParentChildren(roleData.children || []);
            
            // Update parent with fresh stats
            setDetailParent({
                ...parent,
                childrenCount: roleData.total_children || 0
            });
        } catch (error) {
            console.error('Failed to fetch parent profile:', error);
            setParentChildren([]);
        }
    };

    const handleUnlinkChild = async (studentId) => {
        if (!window.confirm('Are you sure you want to unlink this child?')) return;

        try {
            await unlinkParentStudent(detailParent.id, studentId);
            // Refresh parent details
            handleViewDetails(detailParent);
            alert('Child unlinked successfully!');
        } catch (error) {
            console.error('Failed to unlink child:', error);
            alert('Failed to unlink child.');
        }
    };

    const filteredParents = parents.filter(parent =>
        parent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.phone?.includes(searchTerm)
    );

    const filteredStudents = availableStudents.filter(student =>
        student.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Parent Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage parents and their children</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Add New Parent
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Parents</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="size-14 bg-blue-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">family_restroom</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
                            </div>
                            <div className="size-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600 text-3xl">verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Inactive</p>
                                <p className="text-3xl font-bold text-gray-400 mt-2">{stats.total - stats.active}</p>
                            </div>
                            <div className="size-14 bg-gray-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400 text-3xl">pause_circle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Parents Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-500 font-medium">Loading parents...</p>
                            </div>
                        </div>
                    ) : filteredParents.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-gray-300">family_restroom</span>
                            <p className="mt-4 text-gray-500 font-medium">No parents found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                                        <th className="px-8 py-4">Parent</th>
                                        <th className="px-6 py-4">Parent ID</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Children</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredParents.map((parent) => {
                                        const isActive = parent.status?.toLowerCase() === 'active';
                                        
                                        return (
                                            <tr key={parent.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            {parent.full_name?.charAt(0).toUpperCase() || 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{parent.full_name}</p>
                                                            <p className="text-xs text-gray-500">{parent.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                        {parent.id?.slice(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-gray-600">{parent.phone || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-gray-400 text-[18px]">child_care</span>
                                                        <span className="text-sm font-bold">{parent.childrenCount || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button 
                                                        onClick={() => handleStatusToggle(parent)}
                                                        className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase transition-all ${
                                                            isActive 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleLinkChild(parent)}
                                                            className="text-xs font-bold text-primary hover:underline px-2 py-1"
                                                        >
                                                            Link Child
                                                        </button>
                                                        <button 
                                                            onClick={() => handleViewDetails(parent)}
                                                            className="text-xs font-bold text-gray-600 hover:text-primary transition-colors border border-gray-200 hover:border-primary/30 px-3 py-1.5 rounded-lg bg-white"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(parent.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete Parent"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Parent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Parent</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateParent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create Parent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Child Modal */}
            {showLinkChildModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Link Child to Parent</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedParent?.full_name}</p>
                            </div>
                            <button 
                                onClick={() => setShowLinkChildModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitLinkChild} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Students</label>
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all mb-3"
                                />
                                
                                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                                    {filteredStudents.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No students found</p>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <label
                                                key={student.id}
                                                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                                            >
                                                <input
                                                    type="radio"
                                                    name="student"
                                                    value={student.id}
                                                    checked={selectedStudentId === student.id}
                                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                                    className="text-primary focus:ring-primary"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{student.full_name}</p>
                                                    <p className="text-xs text-gray-500">{student.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkChildModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedStudentId}
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Link Child
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Parent Details Modal */}
            {showDetailModal && detailParent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Parent Details</h2>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Parent Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {detailParent.full_name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900">{detailParent.full_name}</h3>
                                        <p className="text-gray-600 mt-1">{detailParent.email}</p>
                                        <p className="text-gray-600">{detailParent.phone || 'No phone'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 font-medium">Total Children</p>
                                        <p className="text-3xl font-bold text-primary">{detailParent.childrenCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Children List */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">child_care</span>
                                    Children
                                </h3>
                                
                                {parentChildren.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                        <span className="material-symbols-outlined text-5xl text-gray-300">child_care</span>
                                        <p className="mt-3 text-gray-500">No children linked yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {parentChildren.map((child) => (
                                            <div key={child.student_id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="size-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {child.student_name?.charAt(0).toUpperCase() || 'S'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">{child.student_name}</h4>
                                                                <p className="text-xs text-gray-500">{child.student_email}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Enrollments */}
                                                        {child.enrollments && child.enrollments.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Enrolled Courses</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {child.enrollments.map((enrollment, idx) => (
                                                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                                                                            {enrollment.course_title}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Batches */}
                                                        {child.batches && child.batches.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Classes</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {child.batches.map((batch, idx) => (
                                                                        <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">
                                                                            {batch.batch_name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleUnlinkChild(child.student_id)}
                                                        className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                                                        title="Unlink child"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">link_off</span>
                                                    </button>
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
