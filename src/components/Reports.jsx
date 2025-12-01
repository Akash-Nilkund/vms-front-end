import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Clock, User, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import visitorService from '../services/visitorService';

const Reports = () => {
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    time: '',
    host: '',
    visitor: '',
    company: '',
    status: ''
  });

  // Unique values for dropdowns
  const [uniqueHosts, setUniqueHosts] = useState([]);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);

  useEffect(() => {
    const fetchVisitors = async () => {
      setIsLoading(true);
      try {
        const data = await visitorService.getHistory();
        
        // Map and Format Data
        const formattedVisitors = data.map(v => {
          // Parse Date (Use inTime, fallback to requestDate)
          const dateToUse = v.inTime || v.requestDate;
          const dateObj = dateToUse ? new Date(dateToUse) : null;
          
          if (!dateObj) {
             return {
               ...v,
               displayDate: 'N/A',
               displayTime: 'N/A',
               timeRange: 'N/A',
               status: v.status,
               timestamp: 0
             };
          }
          
          // Format Date: dd/mm/yy
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = String(dateObj.getFullYear()).slice(-2);
          const formattedDate = `${day}/${month}/${year}`;

          // Format Time using toLocaleTimeString for consistent 12-hour format
          const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
          const formattedTime = dateObj.toLocaleTimeString([], timeOptions);

          // Out Time
          let outTimeDisplay = '-';
          if (v.outTime) {
             const outDate = new Date(v.outTime);
             outTimeDisplay = outDate.toLocaleTimeString([], timeOptions);
          }

          return {
            ...v,
            visitorName: v.visitorName,
            visitorPhoto: v.visitorPhotoUrl,
            displayDate: formattedDate,
            displayTime: formattedTime, // In Time
            outTimeDisplay: outTimeDisplay, // Out Time
            timeRange: (v.outTime && v.status === 'CHECKED_OUT') ? `${formattedTime} - ${outTimeDisplay}` : `${formattedTime} - Active`,
            // Handle host and company objects or strings
            host: typeof v.host === 'object' ? (v.host?.name || v.host?.username || 'Unknown') : (v.host || 'Unknown'),
            company: typeof v.company === 'object' ? (v.company?.name || 'Unknown') : (v.company || 'Unknown'),
            status: v.status,
            timestamp: dateObj.getTime()
          };
        });
        
        // Sort by newest first
        formattedVisitors.sort((a, b) => b.timestamp - a.timestamp);
        setVisitors(formattedVisitors);

        // Extract unique values for filters
        const hosts = [...new Set(formattedVisitors.map(v => v.host).filter(Boolean))]
          .filter(h => h !== 'All Hosts') // Remove if exists to avoid duplicate
          .sort();
        const companies = [...new Set(formattedVisitors.map(v => v.company).filter(Boolean))]
          .filter(c => c !== 'All Companies') // Remove if exists to avoid duplicate
          .sort();
        setUniqueHosts(hosts);
        setUniqueCompanies(companies);

      } catch (error) {
        console.error("Failed to fetch reports", error);
        showNotification("Failed to load reports", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'HISTORY': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Advanced Filtering Logic
  const filteredVisitors = useMemo(() => {
    return visitors.filter(item => {
      // Date Filter (dd/mm/yy)
      if (filters.date && !item.displayDate.includes(filters.date)) return false;
      
      // Time Filter (hh:mm)
      if (filters.time && !item.displayTime.includes(filters.time)) return false;
      
      // Host Filter
      if (filters.host && item.host !== filters.host) return false;
      
      // Company Filter
      if (filters.company && item.company !== filters.company) return false;
      
      // Status Filter
      if (filters.status && item.status !== filters.status) return false;
      
      // Visitor Name Filter (Fuzzy Search)
      if (filters.visitor && !item.visitorName.toLowerCase().includes(filters.visitor.toLowerCase())) return false;

      return true;
    });
  }, [visitors, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      time: '',
      host: '',
      visitor: '',
      company: '',
      status: ''
    });
  };

  const handleDownload = () => {
    if (filteredVisitors.length === 0) {
      showNotification("No data to download", "error");
      return;
    }

    try {
      const dataToExport = filteredVisitors.map(v => ({
        "Visitor Name": v.visitorName,
        "Host Name": v.host,
        "Company Name": v.company,
        "Time": v.timeRange,
        "Status": v.status,
        "Date": v.displayDate
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visitor Report");
      
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Visitor_Report_${timestamp}.xlsx`;

      // Use writeFile which handles Blob creation internally, but wrap in try-catch
      XLSX.writeFile(wb, fileName);
      showNotification("Report downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      showNotification("Failed to download report. Please try again.", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {notification && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in-down ${
          notification.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">All Visitor Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Complete history of all visits</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search visitor..." 
              value={filters.visitor}
              onChange={(e) => handleFilterChange('visitor', e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-lg border transition-colors ${isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-gray-600 hover:bg-gray-100 border-gray-200'}`}
            >
              <Filter size={18} />
            </button>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Filters</h3>
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Date (dd/mm/yy)</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. 28/11/25"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Time (hh:mm)</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. 11:05"
                        value={filters.time}
                        onChange={(e) => handleFilterChange('time', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Host</label>
                    <select 
                      value={filters.host}
                      onChange={(e) => handleFilterChange('host', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Hosts</option>
                      {uniqueHosts.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Company</label>
                    <select 
                      value={filters.company}
                      onChange={(e) => handleFilterChange('company', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="APPROVED">Approved</option>
                      <option value="CHECKED_IN">Checked In</option>
                      <option value="CHECKED_OUT">Checked Out</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
            title="Download Excel Report"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Host & Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No records found matching filters</td>
              </tr>
            ) : (
              filteredVisitors.map((item) => (
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
                           <Clock size={10} /> {item.displayDate}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.timeRange}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
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

export default Reports;
