import { useState, useEffect, useCallback } from 'react';
import { Building, User, Plus, Save } from 'lucide-react';
import visitorService from '../services/visitorService';

const Settings = () => {
    const [companies, setCompanies] = useState([]);
    const [notification, setNotification] = useState(null);
    
    // Company Form State
    const [companyForm, setCompanyForm] = useState({
        name: '',
        address: '' // Optional, but good to have
    });
    const [isAddingCompany, setIsAddingCompany] = useState(false);

    // Host Form State
    const [hostForm, setHostForm] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        companyId: ''
    });
    const [isAddingHost, setIsAddingHost] = useState(false);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const fetchCompanies = useCallback(async () => {
        try {
            const data = await visitorService.getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to fetch companies", error);
            showNotification("Failed to load companies", "error");
        }
    }, [showNotification]);

    // Fetch companies on mount
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setIsAddingCompany(true);
        try {
            await visitorService.createCompany(companyForm);
            showNotification("Company added successfully");
            setCompanyForm({ name: '', address: '' });
            fetchCompanies(); // Refresh list
        } catch (error) {
            console.error("Failed to add company", error);
            showNotification("Failed to add company", "error");
        } finally {
            setIsAddingCompany(false);
        }
    };

    const handleHostSubmit = async (e) => {
        e.preventDefault();
        setIsAddingHost(true);
        try {
            // Ensure companyId is sent as a number if backend expects it, or string.
            // Usually IDs are numbers or UUID strings.
            await visitorService.createHost(hostForm);
            showNotification("Host added successfully");
            setHostForm({ name: '', email: '', phone: '', department: '', companyId: '' });
        } catch (error) {
            console.error("Failed to add host", error);
            showNotification("Failed to add host", "error");
        } finally {
            setIsAddingHost(false);
        }
    };

    return (
        <div className="space-y-8">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in-down ${
                    notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
                }`}>
                    {notification.message}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
                    <p className="text-gray-500 mt-1">Manage companies and hosts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Company Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Building size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Add New Company</h3>
                            <p className="text-sm text-gray-500">Register a new partner company</p>
                        </div>
                    </div>

                    <form onSubmit={handleCompanySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                required
                                value={companyForm.name}
                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                placeholder="e.g. Google, Microsoft"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                            <input
                                type="text"
                                value={companyForm.address}
                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                placeholder="e.g. Mountain View, CA"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isAddingCompany}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isAddingCompany ? 'Adding...' : (
                                <>
                                    <Plus size={18} /> Add Company
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Add Host Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Add New Host</h3>
                            <p className="text-sm text-gray-500">Register a host under a company</p>
                        </div>
                    </div>

                    <form onSubmit={handleHostSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                                <input
                                    type="text"
                                    required
                                    value={hostForm.name}
                                    onChange={(e) => setHostForm({ ...hostForm, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={hostForm.phone}
                                    onChange={(e) => setHostForm({ ...hostForm, phone: e.target.value })}
                                    placeholder="+1 234..."
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={hostForm.email}
                                onChange={(e) => setHostForm({ ...hostForm, email: e.target.value })}
                                placeholder="john@company.com"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={hostForm.department}
                                    onChange={(e) => setHostForm({ ...hostForm, department: e.target.value })}
                                    placeholder="Engineering"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    required
                                    value={hostForm.companyId}
                                    onChange={(e) => setHostForm({ ...hostForm, companyId: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isAddingHost}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isAddingHost ? 'Adding...' : (
                                <>
                                    <Save size={18} /> Save Host
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
