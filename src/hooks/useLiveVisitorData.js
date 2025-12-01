import { useState, useEffect } from 'react';
import visitorService from '../services/visitorService';

const useLiveVisitorData = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [visitors, companies] = await Promise.all([
          visitorService.getHistory(),
          visitorService.getAllCompanies()
        ]);
        processChartData(visitors, companies);
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      }
    };

    fetchChartData();

    const interval = setInterval(fetchChartData, 30000);

    return () => clearInterval(interval);
  }, []);

  const processChartData = (visitors, companies) => {
    if (!Array.isArray(visitors)) return;

    // 1. Calculate Total Visitors Today
    // Use local date for "today" check to match DashboardHome logic
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;

    const totalToday = visitors.filter(v => {
      if (!v.inTime) return false;
      const inTimeDate = new Date(v.inTime);
      const inTimeYear = inTimeDate.getFullYear();
      const inTimeMonth = String(inTimeDate.getMonth() + 1).padStart(2, '0');
      const inTimeDay = String(inTimeDate.getDate()).padStart(2, '0');
      const inTimeLocal = `${inTimeYear}-${inTimeMonth}-${inTimeDay}`;
      
      return inTimeLocal === todayLocal;
    }).length;

    // 2. Calculate Checked-In Visitors per Company (Today)
    // Initialize counts for all companies to 0
    const companyVisitorCounts = {};
    
    // Use fetched companies if available, otherwise fallback to extracting from history
    const companyList = Array.isArray(companies) ? companies : [];
    
    companyList.forEach(c => {
      const name = typeof c === 'object' ? c.name : c;
      if (name) companyVisitorCounts[name] = 0;
    });

    // Count visitors who checked in today
    visitors.forEach(v => {
      let isToday = false;
      if (v.inTime) {
          const inTimeDate = new Date(v.inTime);
          const inTimeYear = inTimeDate.getFullYear();
          const inTimeMonth = String(inTimeDate.getMonth() + 1).padStart(2, '0');
          const inTimeDay = String(inTimeDate.getDate()).padStart(2, '0');
          const inTimeLocal = `${inTimeYear}-${inTimeMonth}-${inTimeDay}`;
          if (inTimeLocal === todayLocal) {
              isToday = true;
          }
      }

      if (isToday) {
        const companyName = typeof v.company === 'object' ? (v.company?.name || 'Unknown') : (v.company || 'Unknown');
        // If company wasn't in the list (e.g. deleted or new), add it
        if (companyVisitorCounts[companyName] === undefined) {
           companyVisitorCounts[companyName] = 0;
        }
        companyVisitorCounts[companyName]++;
      }
    });

    // 3. Construct Labels and Data
    // Filter out 'Unknown' if desired, or keep it. Let's keep it if it has count > 0.
    const companyNames = Object.keys(companyVisitorCounts).filter(name => name !== 'Unknown' || companyVisitorCounts[name] > 0);
    
    const labels = ['Total Visitors', ...companyNames];
    const data = [totalToday, ...companyNames.map(name => companyVisitorCounts[name])];

    // 4. Define Colors
    const backgroundColor = 'rgba(54, 162, 235, 0.8)'; // Solid blue matching sample
    const borderColor = 'rgba(54, 162, 235, 1)';

    setChartData({
      labels,
      datasets: [
        {
          label: 'Visitors',
          data: data,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 1,
          barPercentage: 0.5, // Make bars thinner/clearer like sample
        },
      ],
    });
    setIsConnected(true);
  };

  return { chartData, isConnected };
};

export default useLiveVisitorData;
