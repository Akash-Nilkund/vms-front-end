import { useState, useEffect } from 'react';
import { Upload, User, Building, Mail, Phone, Clock, Briefcase, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { z } from 'zod';
import visitorService from '../services/visitorService';
import { useNavigate } from 'react-router-dom';

const visitorSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyId: z.string().min(1, "Please select a company"),
  hostId: z.string().min(1, "Please select a host"),
  visitorType: z.string().min(1, "Please select a visitor type"),
  duration: z.string().optional(),
  idProof: z.string().min(1, "ID Proof is required"),
  gender: z.string().min(1, "Please select a gender"),
});

const VisitorCheckInForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyId: '',
    hostId: '',
    visitorType: 'GUEST',
    duration: '',
    idProof: '',
    gender: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, hostsData] = await Promise.all([
          visitorService.getAllCompanies(),
          visitorService.getAllHosts()
        ]);
        setCompanies(companiesData);
        setHosts(hostsData);
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'companyId') {
      // If company changes, reset host
      setFormData(prev => ({ ...prev, companyId: value, hostId: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Derived state: Filter hosts based on selected company
  const filteredHosts = formData.companyId 
    ? hosts.filter(host => String(host.companyId) === String(formData.companyId))
    : []; // Or keep 'hosts' if you want to show all when no company is selected

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const validateForm = () => {
    try {
      visitorSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        const issues = err.issues || err.errors || [];
        issues.forEach((error) => {
          if (error.path && error.path[0]) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (actionType) => {
    setSubmitError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare visitor JSON
      const visitorPayload = {
        ...formData,
        name: formData.fullName,
        visitorName: formData.fullName
      };

      // Call register API
      await visitorService.registerVisitor(visitorPayload, photoFile);

      if (actionType === 'checkin') {
        // 1. CHECK-IN FLOW (Now requires approval)
        // We no longer auto-approve or auto-check-in.
        // Just notify the user that their request is pending.
        
        alert('Check-in request submitted! Please wait for admin approval.');
        navigate('/'); 
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          companyId: '',
          hostId: '',
          visitorType: 'GUEST',
          duration: '',
          idProof: '',
          gender: '',
        });
        setPhotoFile(null);
        setPreviewUrl(null);

      } else {
        // 2. PRE-REGISTER FLOW
        alert('Registration successful! Your request is pending approval.');
        navigate('/'); 
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          companyId: '',
          hostId: '',
          visitorType: 'GUEST',
          duration: '',
          idProof: '',
          gender: '',
        });
        setPhotoFile(null);
        setPreviewUrl(null);
      }

    } catch (err) {
      console.error("Submission failed", err);
      setSubmitError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden p-8">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-end mb-2">
          <button
            onClick={() => navigate('/admin-login')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white/50 hover:bg-white hover:text-blue-600 rounded-full border border-gray-200 hover:border-blue-200 transition-all shadow-sm"
          >
            <Lock size={16} />
            <span>Host Login</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome to VMS</h2>
          <p className="text-gray-500 mt-2">Please complete your check-in details below</p>
        </div>

      {/* Photo Upload */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-300" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md text-white">
            <Upload size={18} />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Company & Host Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">Visiting</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.companyId ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none`}
              >
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">Host</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="hostId"
                value={formData.hostId}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.hostId ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none`}
              >
                <option value="">Select Host</option>
                {filteredHosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            {errors.hostId && <p className="text-red-500 text-xs mt-1">{errors.hostId}</p>}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Type & Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">Type</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="visitorType"
                value={formData.visitorType}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="GUEST">Guest</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="INTERVIEW">Interview</option>
                <option value="VENDOR">Vendor</option>
                <option value="VIP">VIP</option>
                <option value="DELEGATE">Delegate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">Duration</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="duration"
                placeholder="e.g. 2 hours"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ID Proof & Gender Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">ID Proof</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="idProof"
                placeholder="Any ID proof which is valid and universal"
                value={formData.idProof}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.idProof ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
              />
            </div>
            {errors.idProof && <p className="text-red-500 text-xs mt-1">{errors.idProof}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1 uppercase tracking-wider text-xs">Gender</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.gender ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleSubmit('checkin')}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : (
              <>
                Check In Now <CheckCircle size={20} />
              </>
            )}
          </button>
          
          <button
            onClick={() => handleSubmit('preregister')}
            disabled={isSubmitting}
            className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-600 font-semibold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Pre-Register for Approval
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default VisitorCheckInForm;
