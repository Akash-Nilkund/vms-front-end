export const COMPANIES = [
    { id: '1', name: 'SNYCE Automations Private Limited' },
    { id: '2', name: 'Global Tech' },
    { id: '3', name: 'Nebula Innovations' },
];

export const HOSTS = [
    { id: '1', name: 'Akash Nilkund', email: 'akashnilkund19@gmail.com' },
    { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: '3', name: 'Robert Johnson', email: 'robert.j@example.com' },
];

export const VISITOR_TYPES = [
    { id: 'contractor', label: 'Contractor' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'vip', label: 'VIP' },
    { id: 'delegate', label: 'Delegate' },
    { id: 'interviewee', label: 'Interviewee' },
];

export const MOCK_VISITS = [
    {
        id: '101',
        visitorName: 'Alice Williams',
        company: 'SNYCE Automations Private Limited',
        hostName: 'Akash Nilkund',
        submissionTime: '2023-10-27T09:15:00',
        status: 'PENDING',
        email: 'alice@tech.com',
        phone: '555-0101',
        visitorType: 'Vendor',
        duration: '2 hours',
    },
    {
        id: '102',
        visitorName: 'Bob Brown',
        company: 'SNYCE Automations Private Limited',
        hostName: 'Akash Nilkund',
        submissionTime: '2023-10-27T09:30:00',
        status: 'APPROVED',
        email: 'bob@logistics.com',
        phone: '555-0102',
        visitorType: 'Contractor',
        duration: '1 day',
    },
    {
        id: '103',
        visitorName: 'Charlie Davis',
        company: 'Freelance',
        hostName: 'Akash Nilkund',
        submissionTime: '2023-10-27T10:00:00',
        status: 'CHECKED_IN',
        email: 'charlie@freelance.com',
        phone: '555-0103',
        visitorType: 'Interviewee',
        duration: '1 hour',
    },
];

export const PENDING_VISITS = MOCK_VISITS;
