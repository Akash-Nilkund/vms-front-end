import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, User, LogIn } from 'lucide-react';
import visitorService from '../services/visitorService';

const PendingApprovalsTable = () => {
  const [approvals, setApprovals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null); // Simple toast state

  useEffect(() => {
    const fetchApprovals = async () => {
      setIsLoading(true);
      try {
        const data = await visitorService.getApprovals();
        
        // Map response to table format
        const pendingVisitors = data.map(v => {
            // Parse Date
            const dateObj = v.requestDate ? new Date(v.requestDate) : new Date();
            
            // Format Date: dd/mm/yy
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = String(dateObj.getFullYear()).slice(-2);
            const formattedDate = `${day}/${month}/${year}`;

            // Format Time: 11.23 am
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedTime = `${hours}.${minutes} ${ampm}`;

            return {
                ...v,
                visitorName: v.visitorName, // Assuming backend returns visitorName directly in Approval DTO
                visitorPhoto: v.visitorPhotoUrl || v.photoUrl, // Check backend DTO field
                displayDate: formattedDate,
                displayTime: formattedTime,
                host: v.hostName || (v.host ? v.host.name : 'Unknown'),
                company: v.companyName || (v.company ? v.company.name : 'Unknown'),
                status: v.status
            };
        });
        setApprovals(pendingVisitors);
      } catch (error) {
        console.error("Failed to fetch approvals", error);
        showNotification("Failed to load data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await visitorService.approveVisitor(id);
        showNotification("Visitor Approved Successfully");
        // Remove from list since this table ONLY shows PENDING
        setApprovals(prev => prev.filter(item => item.id !== id));
      } else if (action === 'reject') {
        await visitorService.rejectVisitor(id);
        showNotification("Visitor Rejected", "error");
        // Remove from list since this table ONLY shows PENDING
        setApprovals(prev => prev.filter(item => item.id !== id));
      } else if (action === 'approve_checkin') {
        // Approve first
        const approvalResponse = await visitorService.approveVisitor(id);
        
        // Then Check-in using visitor ID
        // Assuming approvalResponse contains the visitor object or we can get it from the item
        // Ideally, the backend returns the updated Approval which has a Visitor object
        // Or we can use the visitor ID from the current item if available
        const visitorId = approvalResponse.visitor?.id || approvalResponse.visitorId || approvals.find(a => a.id === id)?.visitor?.id;
        
        if (visitorId) {
            await visitorService.checkInVisitor(visitorId);
            showNotification("Visitor Approved & Checked In Successfully");
        } else {
            console.error("Could not find visitor ID for check-in");
            showNotification("Approved, but failed to auto check-in (ID missing)", "warning");
        }

        setApprovals(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error(`Action ${action} failed`, error);
      showNotification("Action failed. Please try again.", "error");
    }
  };



  const filteredApprovals = approvals.filter(item => 
    (item.visitorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.host?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
          <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
          <p className="text-gray-500 text-sm mt-1">Review and approve visitor requests</p>
        </div>
        
        <div className="flex items-center gap-3">
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
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Host & Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No pending requests found</td>
              </tr>
            ) : (
              filteredApprovals.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                        {item.visitorPhoto ? (
                          <img src={item.visitorPhoto} alt={item.visitorName} className="w-full h-full object-cover" />
                        ) : (
                          (item.visitorName || 'V').split(' ').map(n => n[0]).join('').substring(0, 2)
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">{item.visitorName}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                           <Clock size={10} /> {item.displayDate} • {item.displayTime}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <User size={14} className="text-gray-400" /> {item.host}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 ml-5">
                        {item.company}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAction(item.id, 'approve_checkin')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full border border-transparent hover:border-blue-200 transition-all"
                        title="Approve & Check In (Walk-in)"
                      >
                        <LogIn size={20} />
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full border border-transparent hover:border-green-200 transition-all"
                        title="Approve Only (Pre-reg)"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'reject')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full border border-transparent hover:border-red-200 transition-all"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
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

export default PendingApprovalsTable;
