import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getCategories, getBatches, updateBatch, deleteBatch, getUsers, getBatch, searchUsers, getRoles } from '../services/api';
import Modal from '../components/Modal';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');

    // Action States
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // Member View State
    const [selectedBatchMembers, setSelectedBatchMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Edit Modal State
    const [activeEditTab, setActiveEditTab] = useState('basic');
    const [availableRoles, setAvailableRoles] = useState([]);

    // Member Search State (for Edit)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, categoriesData, batchesData, usersData, rolesData] = await Promise.all([
                    getCourses(),
                    getCategories(),
                    getBatches(),
                    getUsers(),
                    getRoles()
                ]);
                setCourses(coursesData);
                setBatches(batchesData);
                setUsers(usersData);
                setAvailableRoles(rolesData);

                // Create a map of category ID to name for easy lookup
                const catMap = {};
                categoriesData.forEach(cat => {
                    catMap[cat.id] = cat.name;
                });
                setCategories(catMap);

            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        fetchData();
    }, []);

    // Handlers
    const handleView = async (batch) => {
        setIsLoadingMembers(true);
        try {
            const batchData = await getBatch(batch.id);
            setSelectedBatch(batchData);
            setSelectedBatchMembers(batchData.members || []);
            setViewModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch batch details:", error);
            // Fallback to basic data if API fails
            setSelectedBatch(batch);
            setSelectedBatchMembers([]);
            setViewModalOpen(true);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleEdit = async (batch) => {
        setIsLoadingMembers(true);
        setActiveEditTab('basic');
        try {
            // Fetch fresh data
            const batchData = await getBatch(batch.id);
            setSelectedBatch(batchData);
            setSelectedBatchMembers(batchData.members || []);
            setEditFormData({
                batch_name: batchData.batch_name,
                course_id: batchData.course_id,
                teacher_id: batchData.teacher_id || '',
                start_date: batchData.start_date || '',
                end_date: batchData.end_date || '',
                schedule_time: batchData.schedule_time || '',
                total_hours: batchData.total_hours || '',
                status: batchData.status
            });
            setEditModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch batch details for edit:", error);
            // Fallback
            setSelectedBatch(batch);
            setEditFormData({
                batch_name: batch.batch_name,
                course_id: batch.course_id,
                start_date: batch.start_date || '',
                end_date: batch.end_date || '',
                schedule_time: batch.schedule_time || '',
                status: batch.status
            });
            setEditModalOpen(true);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            const newResults = results.filter(u => !selectedBatchMembers.some(m => (m.user_id || m.id) === u.id));
            setSearchResults(newResults);
            setShowResults(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const addMemberFromSearch = (user) => {
        const newMember = {
            user_id: user.id,
            user_name: user.full_name,
            user_email: user.email,
            role_id: availableRoles.find(r => r.name.toLowerCase() === 'student')?.id,
            role: 'student',
            status: 'active'
        };
        setSelectedBatchMembers([...selectedBatchMembers, newMember]);
        setSearchResults([]);
        setShowResults(false);
        setSearchQuery('');
    };

    const removeMember = (indexToRemove) => {
        setSelectedBatchMembers(selectedBatchMembers.filter((_, index) => index !== indexToRemove));
    };

    const handleMemberRoleChange = (index, newRoleId) => {
        const updatedMembers = [...selectedBatchMembers];
        updatedMembers[index].role_id = parseInt(newRoleId);
        updatedMembers[index].role = availableRoles.find(r => r.id === parseInt(newRoleId))?.name;
        setSelectedBatchMembers(updatedMembers);
    };

    const handleDelete = (batch) => {
        setSelectedBatch(batch);
        setDeleteModalOpen(true);
    };

    const onUpdateBatch = async (e) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            // Map members for backend
            const membersPayload = selectedBatchMembers.map(m => ({
                user_id: m.user_id || m.id,
                role_id: m.role_id || availableRoles.find(r => r.name.toLowerCase() === 'student')?.id
            }));

            const payload = {
                ...editFormData,
                course_id: parseInt(editFormData.course_id),
                total_hours: editFormData.total_hours ? parseInt(editFormData.total_hours) : 0,
                members: membersPayload
            };

            await updateBatch(selectedBatch.id, payload);
            // Refresh local state using the confirmed server state or just assume success if we want to be faster. 
            // Better to fetch fresh to ensure everything is synced (ids etc).
            const updatedBatch = await getBatch(selectedBatch.id);
            setBatches(batches.map(b => b.id === selectedBatch.id ? updatedBatch : b));
            setEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update batch:", error);
            alert("Failed to update batch.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const onDeleteBatch = async () => {
        setIsActionLoading(true);
        try {
            await deleteBatch(selectedBatch.id);
            setBatches(batches.filter(b => b.id !== selectedBatch.id));
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete batch:", error);
            alert("Failed to delete batch.");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark p-4 md:p-8 h-full overflow-y-auto scroll-smooth">
            <div className="max-w-[1600px] mx-auto w-full space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Global Course Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage curriculum, approvals, and course
                            settings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/classes/create"
                            className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary bg-white dark:bg-transparent dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium shadow-sm hover:shadow-md">
                            <span className="material-symbols-outlined text-xl">calendar_add_on</span>
                            <span>Create New Class</span>
                        </Link>
                        <Link to="/courses/create"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors font-medium">
                            <span className="material-symbols-outlined text-xl">add</span>
                            <span>Create New Course</span>
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stats Cards - kept static for now as API doesn't provide stats directly */}
                    <div
                        className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div
                            className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">library_books</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total
                                Courses</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{courses.length}</h3>
                        </div>
                    </div>
                    <div
                        className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div
                            className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">groups</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active
                                Students</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">3,405</h3>
                        </div>
                    </div>
                    <div
                        className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div
                            className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total
                                Teachers</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">86</h3>
                        </div>
                    </div>
                    <div
                        className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div
                            className="size-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">attach_money</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Revenue</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">$245.8k</h3>
                        </div>
                    </div>
                </div>
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`pb-4 text-sm font-semibold relative ${activeTab === 'courses' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            All Courses
                            {activeTab === 'courses' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`pb-4 text-sm font-semibold relative ${activeTab === 'classes' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Classes (Batches)
                            {activeTab === 'classes' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3 space-y-4">
                        {activeTab === 'courses' ? (
                            <>
                                <div
                                    className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-[#15202b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="relative flex-1 max-w-md">
                                        <span
                                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                            placeholder="Search by course name..." type="text" />
                                    </div>
                                    <div className="flex gap-3">
                                        <select
                                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 cursor-pointer py-2 pl-3 pr-8">
                                            <option>All Categories</option>
                                            {Object.values(categories).map(name => (
                                                <option key={name}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div
                                    className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr
                                                    className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                                    <th className="px-6 py-4 min-w-[200px]">Course Name</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4">Assigned Teacher</th>
                                                    <th className="px-6 py-4 text-center">Enrolled</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                                            Loading courses...
                                                        </td>
                                                    </tr>
                                                ) : courses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                                            No courses found. Create one to get started!
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    courses.map((course) => (
                                                        <tr key={course.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                                                                        {course.image ? (
                                                                            <img src={course.image} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="material-symbols-outlined">code</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                            {course.title}</h4>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{course.level} •
                                                                            {course.duration_weeks} Weeks</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                    {categories[course.category_id] || 'Uncategorized'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                                        TBD
                                                                    </div>
                                                                    <span className="text-sm text-slate-600 dark:text-slate-300">Unassigned</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span
                                                                    className="text-sm font-semibold text-slate-900 dark:text-white">0</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                                    <span
                                                                        className={`size-1.5 rounded-full ${course.status ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400'}`}></span>
                                                                    {course.status ? 'Active' : 'Draft'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                                    <button
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                                                                        title="Edit">
                                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                                    </button>
                                                                    <button
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                                                                        title="Duplicate">
                                                                        <span className="material-symbols-outlined text-lg">content_copy</span>
                                                                    </button>
                                                                    <button
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                                                                        title="Delete">
                                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div
                                        className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Showing {courses.length} courses</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50">Previous</button>
                                            <button className="px-3 py-1 text-sm bg-primary text-white rounded-md shadow-sm">1</button>
                                            <button
                                                className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Next</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Classes / Batches Table */}
                                <div
                                    className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-[#15202b] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="relative flex-1 max-w-md">
                                        <span
                                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                            placeholder="Search by batch name..." type="text" />
                                    </div>
                                    <div className="flex gap-3">
                                        <select
                                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 cursor-pointer py-2 pl-3 pr-8">
                                            <option>All Statuses</option>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div
                                    className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr
                                                    className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                                    <th className="px-6 py-4 min-w-[200px]">Batch Name</th>
                                                    <th className="px-6 py-4">Course</th>
                                                    <th className="px-6 py-4">Start Date</th>
                                                    <th className="px-6 py-4">Schedule</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                                            Loading batches...
                                                        </td>
                                                    </tr>
                                                ) : batches.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                                            No batches found. Create one to get started!
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    batches.map((batch) => (
                                                        <tr key={batch.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                                                                        <span className="material-symbols-outlined">class</span>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                            {batch.batch_name}</h4>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400">ID: #{batch.id}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    {courses.find(c => c.id === batch.course_id)?.title || 'Unknown Course'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {batch.start_date || 'TBD'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {batch.schedule_time || 'TBD'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.status
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                                    <span
                                                                        className={`size-1.5 rounded-full ${batch.status ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400'}`}></span>
                                                                    {batch.status ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                                    <button
                                                                        onClick={() => handleEdit(batch)}
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                                                                        title="Edit">
                                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleView(batch)}
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                                                                        title="View Details">
                                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(batch)}
                                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                                                                        title="Delete">
                                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div
                                        className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Showing {batches.length} batches</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50">Previous</button>
                                            <button className="px-3 py-1 text-sm bg-primary text-white rounded-md shadow-sm">1</button>
                                            <button
                                                className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Next</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="xl:col-span-1 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Approvals</h3>
                            <span
                                className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">3
                                Pending</span>
                        </div>
                        <div className="space-y-4">
                            <div
                                className="bg-white dark:bg-[#15202b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="size-2 rounded-full bg-red-500 block"></span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white pr-4">Machine Learning Basics</h4>
                                <div className="flex items-center gap-2 mt-2 mb-4">
                                    <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 block"></div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Submitted by Mr.
                                        Anderson</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">A foundational
                                    course covering supervised and unsupervised learning algorithms with Python examples.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 py-2 text-xs font-semibold bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">Approve</button>
                                    <button
                                        className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Reject</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Modals --- */}

                {/* View Modal */}
                <Modal
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                    title="Batch Details"
                    footer={
                        <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 font-medium">Close</button>
                    }
                >
                    {selectedBatch && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Batch Name</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{selectedBatch.batch_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Course</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{courses.find(c => c.id === selectedBatch.course_id)?.title || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{selectedBatch.start_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{selectedBatch.end_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Teacher</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{selectedBatch.teacher_name || 'Unassigned'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Schedule</label>
                                    <p className="text-slate-900 dark:text-white font-medium">{selectedBatch.schedule_time || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${selectedBatch.status ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {selectedBatch.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Enrolled Members ({selectedBatchMembers.length})</h4>
                                {isLoadingMembers ? (
                                    <div className="text-center py-4 text-slate-500 text-sm">Loading members...</div>
                                ) : selectedBatchMembers.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl">No members enrolled in this batch.</div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                <tr>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2">Role</th>
                                                    <th className="px-4 py-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {selectedBatchMembers.map((member, index) => {
                                                    return (
                                                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                                                                {member.user_name}
                                                                <div className="text-xs text-slate-400 font-normal">{member.user_email}</div>
                                                            </td>
                                                            <td className="px-4 py-2 text-slate-600 dark:text-slate-400 capitalize">{member.role || 'Student'}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {member.status}
                                                                </span>
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
                    )}
                </Modal>

                {/* Edit Modal */}
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Edit Batch"
                    footer={
                        <>
                            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium">Cancel</button>
                            <button onClick={onUpdateBatch} disabled={isActionLoading} className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-70 transition-colors font-medium">
                                {isActionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    }
                >
                    <div className="flex flex-col h-[600px] max-h-[80vh]">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                            <button
                                onClick={() => setActiveEditTab('basic')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeEditTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                            >
                                Basic Info
                            </button>
                            <button
                                onClick={() => setActiveEditTab('schedule')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeEditTab === 'schedule' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                            >
                                Schedule
                            </button>
                            <button
                                onClick={() => setActiveEditTab('members')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeEditTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                            >
                                Members ({selectedBatchMembers.length})
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {activeEditTab === 'basic' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Name</label>
                                        <input
                                            type="text"
                                            value={editFormData.batch_name || ''}
                                            onChange={e => setEditFormData({ ...editFormData, batch_name: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                                        <select
                                            value={editFormData.course_id || ''}
                                            onChange={e => setEditFormData({ ...editFormData, course_id: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="" disabled>Select Course</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Teacher</label>
                                        <select
                                            value={editFormData.teacher_id || ''}
                                            onChange={e => setEditFormData({ ...editFormData, teacher_id: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Select Teacher</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.email} {u.full_name ? `(${u.full_name})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editFormData.status || false}
                                                onChange={e => setEditFormData({ ...editFormData, status: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Active Status</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {activeEditTab === 'schedule' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={editFormData.start_date || ''}
                                                onChange={e => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={editFormData.end_date || ''}
                                                onChange={e => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Schedule Time</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10:00 AM - 12:00 PM"
                                            value={editFormData.schedule_time || ''}
                                            onChange={e => setEditFormData({ ...editFormData, schedule_time: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Hours</label>
                                        <input
                                            type="number"
                                            value={editFormData.total_hours || ''}
                                            onChange={e => setEditFormData({ ...editFormData, total_hours: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeEditTab === 'members' && (
                                <div className="space-y-4">
                                    {/* Add Member Search */}
                                    <div className="relative">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="Search user by name/email to add..."
                                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={isSearching}
                                                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {isSearching ? '...' : 'Add'}
                                            </button>
                                        </div>
                                        {showResults && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto">
                                                {searchResults.length === 0 ? (
                                                    <div className="p-3 text-center text-sm text-slate-500">No users found</div>
                                                ) : (
                                                    searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => addMemberFromSearch(user)}
                                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                                                        >
                                                            <div className="font-semibold text-slate-900 dark:text-white">{user.full_name}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Members List */}
                                    <div className="space-y-2">
                                        {selectedBatchMembers.map((member, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {(member.user_name || '?').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{member.user_name}</div>
                                                    <div className="text-xs text-slate-500 truncate">{member.user_email}</div>
                                                </div>
                                                <select
                                                    value={member.role_id || ''}
                                                    onChange={(e) => handleMemberRoleChange(index, e.target.value)}
                                                    className="text-xs py-1 px-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-primary/50 cursor-pointer"
                                                >
                                                    {availableRoles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => removeMember(index)}
                                                    className="size-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        {selectedBatchMembers.length === 0 && (
                                            <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                No members assigned. Search to add members.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>

                {/* Delete Modal */}
                <Modal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    title="Confirm Delete"
                    footer={
                        <>
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium">Cancel</button>
                            <button onClick={onDeleteBatch} disabled={isActionLoading} className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-70 transition-colors font-medium">
                                {isActionLoading ? 'Deleting...' : 'Delete Batch'}
                            </button>
                        </>
                    }
                >
                    <div className="py-2">
                        <p className="text-slate-600 dark:text-slate-300">
                            Are you sure you want to delete the batch <span className="font-bold text-slate-900 dark:text-white">"{selectedBatch?.batch_name}"</span>?
                            This action cannot be undone.
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );

}
