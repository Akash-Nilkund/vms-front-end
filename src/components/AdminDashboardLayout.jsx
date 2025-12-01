import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FileText, LogOut, Settings, Bell, Search, Menu, Shield } from 'lucide-react';
import authService from '../services/authService';

const AdminDashboardLayout = () => {

    const navigate = useNavigate();
    // const user = authService.getCurrentUser(); // 🔥 Get logged-in admin (Unused now)

    const handleLogout = () => {
        authService.logout();
        navigate("/", { replace: true });  // 🔥 Redirect to check-in form
    };

    const initials = "HO"; // 🔥 Fixed initials for Host

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
                <div className="p-8 border-b border-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            V
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg block">VMS Host</span>
                            <span className="text-xs text-slate-500 uppercase">Secure Panel</span>
                        </div>
                    </div>
                </div>

                {/* Left Menu */}
                <nav className="flex-1 p-6 space-y-2">

                    <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-4">Main Menu</p>

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl 
                            ${isActive ? 'bg-primary-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/approvals"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl 
                            ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <CheckSquare className="w-5 h-5" />
                        Approvals
                    </NavLink>

                    <NavLink
                        to="/admin/security"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl 
                            ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Shield className="w-5 h-5" />
                        Security Console
                    </NavLink>

                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl 
                            ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <FileText className="w-5 h-5" />
                        Reports
                    </NavLink>

                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-xl 
                            ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </NavLink>
                </nav>

                {/* Logout Button */}
                <div className="p-6 border-t border-slate-800/50">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                
                {/* Top Header */}
                <header className="h-20 bg-white border-b flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <Menu className="w-6 h-6 lg:hidden text-slate-500" />
                        <div className="relative w-80 hidden md:block">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search visitors..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Bell className="w-5 h-5 text-slate-500" />
                        <div className="flex items-center gap-3 pl-6 border-l h-10">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold">Host</p>
                                <p className="text-xs text-slate-500">Security Access</p>
                            </div>
                            <div className="w-10 h-10 bg-primary-200 text-primary-700 rounded-full 
                                flex items-center justify-center font-bold border shadow">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardLayout;
