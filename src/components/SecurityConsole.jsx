import { useState, useEffect, useCallback } from 'react';
import { Search, LogOut, User } from 'lucide-react';
import visitorService from '../services/visitorService';

const SecurityConsole = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await visitorService.getActiveVisitors();
      
      console.log("Active visitors data:", data); // Debug log
      
      const mappedVisitors = data.map(v => ({
        ...v,
        id: v.id,
        // Try to find approvalId from nested object or use root id if it looks like an approval
        approvalId: v.approval?.id || v.id,
        visitorName: v.name || v.visitorName,
        // Construct photo URL if imagePath exists, otherwise use photoUrl or null
        visitorPhoto: v.imagePath 
          ? `http://localhost:8080/visitor-photos/${v.imagePath}` 
          : (v.photoUrl || null),
        type: v.type || 'VISITOR',
        // Handle host and company objects or strings
        hostName: typeof v.host === 'object' ? (v.host?.name || v.host?.username || 'Unknown') : (v.host || 'Unknown'),
        companyName: typeof v.company === 'object' ? (v.company?.name || 'Unknown') : (v.company || 'Unknown'),
        checkInTime: v.inTime ? new Date(v.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
        status: 'CHECKED_IN' // Active visitors are by definition checked in
      }));

      setVisitors(mappedVisitors);
    } catch (error) {
      console.error("Failed to fetch active visitors", error);
      showNotification("Failed to load active visitors", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleCheckOut = async (id) => {
    if (window.confirm("Are you sure you want to check out this visitor?")) {
      if (!id) {
        showNotification("Error: Missing Approval ID", "error");
        return;
      }
      console.log("Checking out approvalId:", id);
      try {
        await visitorService.checkOutVisitor(id);
        showNotification("Visitor checked out successfully");
        fetchVisitors(); // Refresh list
      } catch (error) {
        console.error("Check-out failed", error);
        showNotification("Failed to check out visitor", "error");
      }
    }
  };

  const handleCheckOutAll = async () => {
    if (window.confirm("Are you sure you want to check out ALL active visitors? This action cannot be undone.")) {
      setIsLoading(true);
      try {
        // Iterate through all active visitors and check them out one by one
        // Ideally, backend should support bulk checkout, but we'll loop for now
        const checkoutPromises = visitors.map(v => visitorService.checkOutVisitor(v.approvalId));
        await Promise.allSettled(checkoutPromises);
        
        showNotification("All visitors checked out successfully");
        fetchVisitors();
      } catch (error) {
        console.error("Bulk check-out failed", error);
        showNotification("Failed to check out some visitors", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredVisitors = visitors.filter(item => 
    (item.visitorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.hostName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in-down ${
          notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Security Console</h2>
          <p className="text-gray-500 text-sm mt-1">Manage Visitor Check-Out</p>
        </div>
        
        <div className="flex items-center gap-3">
          {visitors.length > 0 && (
            <button
              onClick={handleCheckOutAll}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Check Out All
            </button>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search visitors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Host & Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-In Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading active visitors...</td>
              </tr>
            ) : filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No active visitors found</td>
              </tr>
            ) : (
              filteredVisitors.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                        {item.visitorPhoto ? (
                          <img src={item.visitorPhoto} alt={item.visitorName} className="w-full h-full object-cover" />
                        ) : (
                          (item.visitorName || 'V').split(' ').map(n => n[0]).join('').substring(0, 2)
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.visitorName}</span>
                        <span className="text-xs text-gray-500 break-words">{item.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <User size={14} className="text-gray-400" /> {item.hostName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 ml-5">
                        {item.companyName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.checkInTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                      Checked In
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleCheckOut(item.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ml-auto"
                      >
                        <LogOut size={16} /> Check Out
                      </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityConsole;
