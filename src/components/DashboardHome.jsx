import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock } from 'lucide-react';
import PropTypes from 'prop-types';
import LiveVisitorChart from './LiveVisitorChart';
import visitorService from '../services/visitorService';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalToday: 0,
    active: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await visitorService.getHistory();
        
        // Calculate stats from history
        // Use local date for "today" check
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayLocal = `${year}-${month}-${day}`;
        
        const totalToday = data.filter(v => {
          if (!v.inTime) return false;
          // Check if inTime (which might be ISO string) matches today's date in local time
          const inTimeDate = new Date(v.inTime);
          const inTimeYear = inTimeDate.getFullYear();
          const inTimeMonth = String(inTimeDate.getMonth() + 1).padStart(2, '0');
          const inTimeDay = String(inTimeDate.getDate()).padStart(2, '0');
          const inTimeLocal = `${inTimeYear}-${inTimeMonth}-${inTimeDay}`;
          
          return inTimeLocal === todayLocal;
        }).length;

        const active = data.filter(v => v.status === 'CHECKED_IN').length;
        const pending = data.filter(v => v.status === 'PENDING').length;

        setStats({
          totalToday,
          active,
          pending
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setIsLoading(false);
      }
    };

    fetchStats();

    // Optional: Set up polling to keep it "live" without backend WS changes for now
    const interval = setInterval(fetchStats, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">
          {isLoading ? '-' : value}
        </h3>
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Visitors Today" 
          value={stats.totalToday} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Currently On-Site" 
          value={stats.active} 
          icon={UserCheck} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-yellow-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px]">
          <LiveVisitorChart />
        </div>
        {/* Placeholder for future charts or recent activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex items-center justify-center text-gray-400">
          <p>Additional Analytics Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
