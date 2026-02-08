import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, signup, getUserProfile } from '../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        students: 0,
        teachers: 0,
        parents: 0,
        coordinators: 0,
        active: 0,
        pending: 0
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'student'
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await getUsers();
            setUsers(allUsers);
            
            // Calculate stats
            const students = allUsers.filter(u => u.role?.toLowerCase() === 'student').length;
            const teachers = allUsers.filter(u => u.role?.toLowerCase() === 'teacher' || u.role?.toLowerCase() === 'instructor').length;
            const parents = allUsers.filter(u => u.role?.toLowerCase() === 'parent').length;
            const coordinators = allUsers.filter(u => u.role?.toLowerCase() === 'coordinator' || u.role?.toLowerCase() === 'admin').length;
            const active = allUsers.filter(u => u.status?.toLowerCase() === 'active').length;
            const pending = allUsers.filter(u => u.status?.toLowerCase() === 'requested').length;
            
            setStats({
                total: allUsers.length,
                students,
                teachers,
                parents,
                coordinators,
                active,
                pending
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            if (isEditing && selectedUser) {
                // Update existing user
                await updateUser(selectedUser.id, formData);
            } else {
                // Create new user
                await signup({
                    ...formData,
                    status: 'active'
                });
            }

            setShowCreateModal(false);
            setFormData({ full_name: '', email: '', phone: '', password: '', role: 'student' });
            setSelectedUser(null);
            setIsEditing(false);
            fetchUsers();
        } catch (error) {
            console.error(isEditing ? 'Failed to update user:' : 'Failed to create user:', error);
            alert(isEditing ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || '',
            password: '', // Leave empty to not change
            role: user.role
        });
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleViewClick = async (user) => {
        setSelectedUser(user);
        setUserProfile(null);
        setLoadingProfile(true);
        setShowViewModal(true);
        
        try {
            const data = await getUserProfile(user.id);
            setUserProfile(data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setFormData({ full_name: '', email: '', phone: '', password: '', role: 'student' });
        setSelectedUser(null);
        setUserProfile(null);
        setIsEditing(false);
    };

    const handleStatusToggle = async (user) => {
        try {
            const newStatus = user.status?.toLowerCase() === 'active' ? 'disabled' : 'active';
            await updateUser(user.id, { status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    const handleApproveUser = async (user) => {
        try {
            await updateUser(user.id, { status: 'active' });
            fetchUsers();
        } catch (error) {
            console.error('Failed to approve user:', error);
            alert('Failed to approve user. Please try again.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const getRoleBadgeColor = (role) => {
        const r = role?.toLowerCase();
        if (r === 'student') return 'bg-blue-50 text-blue-600';
        if (r === 'teacher' || r === 'instructor') return 'bg-purple-50 text-purple-600';
        if (r === 'parent') return 'bg-emerald-50 text-emerald-600';
        if (r === 'coordinator' || r === 'admin') return 'bg-amber-50 text-amber-600';
        return 'bg-slate-50 text-slate-600';
    };

    const getRoleIcon = (role) => {
        const r = role?.toLowerCase();
        if (r === 'student') return 'school';
        if (r === 'teacher' || r === 'instructor') return 'person_book';
        if (r === 'parent') return 'family_restroom';
        if (r === 'coordinator' || r === 'admin') return 'manage_accounts';
        return 'person';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.phone?.includes(searchTerm);
        
        const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
        
        // Status filtering: 
        // - 'requested' users always go to the Pending Approval section
        // - When filterStatus is 'all', show only 'active' users (not disabled)
        // - When filterStatus is specific, show that status
        const userStatus = user.status?.toLowerCase();
        let matchesStatus;
        if (userStatus === 'requested') {
            matchesStatus = false; // Always exclude requested from main table
        } else if (filterStatus === 'all') {
            matchesStatus = userStatus === 'active'; // Default: show only active
        } else {
            matchesStatus = userStatus === filterStatus.toLowerCase();
        }
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Get pending/requested users
    const pendingUsers = users.filter(user => user.status?.toLowerCase() === 'requested');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage all users across the platform</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Add New User
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-7 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="size-14 bg-slate-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-600 text-3xl">group</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Students</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.students}</p>
                            </div>
                            <div className="size-14 bg-blue-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">school</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Teachers</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.teachers}</p>
                            </div>
                            <div className="size-14 bg-purple-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-600 text-3xl">person_book</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Parents</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.parents}</p>
                            </div>
                            <div className="size-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600 text-3xl">family_restroom</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Admins</p>
                                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.coordinators}</p>
                            </div>
                            <div className="size-14 bg-amber-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-600 text-3xl">manage_accounts</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
                            </div>
                            <div className="size-14 bg-green-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-3xl">verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm relative overflow-hidden">
                        {stats.pending > 0 && (
                            <div className="absolute top-2 right-2">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                            </div>
                            <div className="size-14 bg-orange-50 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-600 text-3xl">pending_actions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Approval Section */}
            {pendingUsers.length > 0 && (
                <div className="px-8 pb-6">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
                        <div className="p-6 border-b border-orange-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-xl">pending_actions</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Pending Approval</h2>
                                    <p className="text-sm text-gray-500">{pendingUsers.length} new user(s) waiting for approval</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-orange-100/50 text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                                        <th className="px-8 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Role</th>
                                        <th className="px-6 py-4 text-left">Phone</th>
                                        <th className="px-6 py-4 text-left">Registered</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-100">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="bg-white/50 hover:bg-white transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                        <span className="material-symbols-outlined text-lg">{getRoleIcon(user.role)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{user.full_name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-gray-600">{user.phone || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-gray-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleViewClick(user)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApproveUser(user)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all shadow-md shadow-green-500/20"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="px-8 pb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Filters */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-4">
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
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="teacher">Teachers</option>
                                <option value="parent">Parents</option>
                                <option value="coordinator">Coordinators</option>
                                <option value="admin">Admins</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-500 font-medium">Loading users...</p>
                            </div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-gray-300">group</span>
                            <p className="mt-4 text-gray-500 font-medium">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-6 py-4">User ID</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => {
                                        const isActive = user.status?.toLowerCase() === 'active';
                                        
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            <span className="material-symbols-outlined text-lg">{getRoleIcon(user.role)}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{user.full_name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                        {user.id?.slice(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-gray-600">{user.phone || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button 
                                                        onClick={() => handleStatusToggle(user)}
                                                        className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase transition-all ${
                                                            isActive 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isActive ? 'Active' : 'Disabled'}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleViewClick(user)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete User"
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

            {/* Create/Edit User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="parent">Parent</option>
                                    <option value="coordinator">Coordinator</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {!isEditing && (
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
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {isCreating ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white relative">
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex flex-col items-center">
                                <div className="size-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-4">
                                    <span className="material-symbols-outlined text-4xl">{getRoleIcon(selectedUser.role)}</span>
                                </div>
                                <h2 className="text-2xl font-bold">{selectedUser.full_name}</h2>
                                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/20 backdrop-blur-sm`}>
                                    {selectedUser.role}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                                <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                                    <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                                </div>

                                <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                                    <p className="text-gray-900 font-medium">{selectedUser.phone || 'N/A'}</p>
                                </div>

                                <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">badge</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">User ID</p>
                                    <p className="text-gray-500 font-mono text-xs">{selectedUser.id}</p>
                                </div>

                                <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">verified</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${
                                        selectedUser.status === 'active' ? 'bg-green-100 text-green-700' : 
                                        selectedUser.status === 'requested' ? 'bg-orange-100 text-orange-700' : 
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {selectedUser.status}
                                    </span>
                                </div>

                                <div className="size-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined">calendar_today</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Joined</p>
                                    <p className="text-gray-900 font-medium">
                                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Role Specific Data (Loading / Display) */}
                            {loadingProfile ? (
                                <div className="flex justify-center py-4 border-t border-gray-100">
                                    <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : userProfile?.role_data && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                        {selectedUser.role} Stats
                                    </h3>
                                    
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {userProfile.role_data.total_batches !== undefined && (
                                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-bold text-gray-900">{userProfile.role_data.total_batches}</p>
                                                <p className="text-xs text-gray-500 font-medium uppercase mt-1">Batches</p>
                                            </div>
                                        )}
                                        {userProfile.role_data.total_courses !== undefined && (
                                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-bold text-gray-900">{userProfile.role_data.total_courses}</p>
                                                <p className="text-xs text-gray-500 font-medium uppercase mt-1">Courses</p>
                                            </div>
                                        )}
                                        {userProfile.role_data.total_students !== undefined && (
                                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-bold text-gray-900">{userProfile.role_data.total_students}</p>
                                                <p className="text-xs text-gray-500 font-medium uppercase mt-1">Students</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Batches List for Teachers */}
                                    {userProfile.role_data.batches && userProfile.role_data.batches.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-2">Active Batches</p>
                                            <div className="space-y-2">
                                                {userProfile.role_data.batches.map(batch => (
                                                    <div key={batch.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{batch.batch_name}</p>
                                                            <p className="text-xs text-gray-500">{batch.course?.title}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                                                                {batch.schedule_time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setShowViewModal(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
