import apiClient from './api';

const VISITOR_API = '/api/visitors';

export const visitorService = {
    // GET - Fetch all visitors
    getAllVisitors: async () => {
        const response = await apiClient.get(VISITOR_API);
        return response.data;
    },

    // GET - Fetch visitor by ID
    getVisitorById: async (id) => {
        const response = await apiClient.get(`${VISITOR_API}/${id}`);
        return response.data;
    },

    // POST - Register new visitor (New Flow)
    registerVisitor: async (visitorData, photoFile = null) => {
        const formData = new FormData();
        formData.append("visitorJsonData", JSON.stringify(visitorData));
        
        if (photoFile) {
            formData.append("photo", photoFile);
        }

        try {
            const response = await apiClient.post(`${VISITOR_API}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("Visitor registered:", response.data);
            return response.data;
        } catch (err) {
            console.error("Registration failed:", err.response?.data);
            throw err;
        }
    },

    // POST - Create new visitor (Legacy/Admin direct create if needed, otherwise deprecate)
    createVisitor: async (visitorData) => {
        const response = await apiClient.post(VISITOR_API, visitorData);
        return response.data;
    },

    // PUT - Update visitor
    updateVisitor: async (id, visitorData) => {
        const response = await apiClient.put(`${VISITOR_API}/${id}`, visitorData);
        return response.data;
    },

    // GET - Fetch pending approvals
    getApprovals: async () => {
        const response = await apiClient.get('/api/admin/approvals?status=PENDING');
        return response.data;
    },

    // PATCH - Approve visitor
    approveVisitor: async (id) => {
        const response = await apiClient.patch(`/api/approvals/${id}/approve`);
        return response.data;
    },

    // PATCH - Reject visitor
    rejectVisitor: async (id) => {
        const response = await apiClient.patch(`/api/approvals/${id}/reject`);
        return response.data;
    },

    // PATCH - Check-in visitor
    checkInVisitor: async (id) => {
        const response = await apiClient.patch(`${VISITOR_API}/${id}/checkin`);
        return response.data;
    },

    // PATCH - Check-out visitor
    checkOutVisitor: async (approvalId) => {
        const response = await apiClient.patch(`${VISITOR_API}/${approvalId}/checkout`);
        return response.data;
    },

    // DELETE - Delete visitor
    deleteVisitor: async (id) => {
        const response = await apiClient.delete(`${VISITOR_API}/${id}`);
        return response.data;
    },

    // GET - Search visitors
    searchVisitors: async (searchParams) => {
        const response = await apiClient.get(VISITOR_API, {
            params: searchParams
        });
        return response.data;
    },

    // POST - Upload visitor photo
    uploadVisitorPhoto: async (id, photoFile) => {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const response = await apiClient.post(
            `${VISITOR_API}/${id}/photo`,
            formData
        );
        return response.data;
    },

    // GET - Fetch all companies
    getAllCompanies: async () => {
        const response = await apiClient.get('/api/companies');
        return response.data;
    },

    // GET - Fetch all hosts
    getAllHosts: async () => {
        const response = await apiClient.get('/api/hosts');
        return response.data;
    },

    // POST - Create new company
    createCompany: async (companyData) => {
        const response = await apiClient.post('/api/companies', companyData);
        return response.data;
    },

    // POST - Create new host
    createHost: async (hostData) => {
        const response = await apiClient.post('/api/hosts', hostData);
        return response.data;
    },

    // GET - Fetch history/reports
    getHistory: async () => {
        const response = await apiClient.get('/api/admin/history');
        return response.data;
    },

    // GET - Fetch approved visitors for security console
    getApprovedVisitors: async () => {
        // Assuming backend supports filtering or we fetch all and filter client side if specific endpoint missing
        // Ideally: GET /api/visitors?status=APPROVED,CHECKED_IN
        // For now, let's try to fetch all and filter, or use a specific endpoint if we designed one.
        // Based on prompt: "Security Console - Check-In/Out" logic implies we need a list.
        // Let's assume we can use getAllVisitors and filter, or if there's a specific one.
        // The prompt says "Logic: Check-In: Call PATCH ...". It doesn't explicitly say how to fetch the list for security console,
        // but typically it's a list of people expected today.
        // Let's add a method that might be useful, or just use getAllVisitors in the component.
        // I'll add a helper here just in case.
        const response = await apiClient.get(VISITOR_API);
        return response.data; 
    },

    // GET - Fetch active visitors (checked-in)
    getActiveVisitors: async () => {
        const response = await apiClient.get('/api/admin/active-visitors');
        return response.data;
    },

    // GET - Dashboard Stats (Aggregated)
    getDashboardStats: async () => {
        // Fetch data in parallel
        const [visitors, active, approvals] = await Promise.all([
            apiClient.get(VISITOR_API),
            apiClient.get('/api/admin/active-visitors'),
            apiClient.get('/api/admin/approvals?status=PENDING')
        ]);

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const totalToday = visitors.data.filter(v => v.inTime && v.inTime.startsWith(today)).length;

        return {
            totalToday,
            active: active.data.length,
            pending: approvals.data.length
        };
    },

    // GET - Visitor Status Counts for Chart
    getVisitorStatusCounts: async () => {
        const response = await apiClient.get(VISITOR_API);
        const visitors = response.data;
        
        const counts = {
            'APPROVED': 0,
            'CHECKED_IN': 0,
            'CHECKED_OUT': 0,
            'PENDING': 0,
            'REJECTED': 0
        };

        visitors.forEach(v => {
            if (counts[v.status] !== undefined) {
                counts[v.status]++;
            }
        });

        return counts;
    }
};

export default visitorService;
