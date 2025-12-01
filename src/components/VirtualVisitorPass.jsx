import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

const VirtualVisitorPass = ({ visitor }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const data = location.state?.visitor || visitor;

  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true });
    }
  }, [data, navigate]);

  if (!data) return null;



  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      {/* Main Card Container - Compact ID Card Style */}
      <div className="w-full max-w-md bg-white shadow-xl overflow-hidden border border-gray-300 rounded-lg print:shadow-none print:border-2 print:border-gray-800">
        
        {/* HEADER SECTION */}
        <div className="bg-blue-900 p-4 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider print:text-black">
            VISITOR PASS
          </h1>
        </div>

        {/* BODY SECTION - Split Layout */}
        <div className="p-5 flex flex-row gap-4">
          
          {/* LEFT COLUMN - Details */}
          <div className="flex-1 space-y-2">
             <div className="grid grid-cols-1 gap-1">
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Name</span>
                   <span className="text-sm font-semibold text-gray-900 block">{data.fullName || 'N/A'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Contact</span>
                   <span className="text-sm text-gray-800 block">{data.phone || 'N/A'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Email</span>
                   <span className="text-xs text-gray-800 block break-all">{data.email || 'N/A'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">ID Proof</span>
                   <span className="text-sm text-gray-800 block">
                     {data.idProof ? (
                       data.idProof.length > 4 
                         ? `${data.idProof.slice(0, 2)}****${data.idProof.slice(-2)}`
                         : data.idProof
                     ) : 'N/A'}
                   </span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Gender</span>
                   <span className="text-sm text-gray-800 block">{data.gender || 'N/A'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Host</span>
                   <span className="text-sm text-gray-800 block">{data.host || 'N/A'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Type</span>
                   <span className="text-sm font-semibold text-blue-800 uppercase block">{data.type || 'VISITOR'}</span>
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 uppercase block">Check-In</span>
                   <span className="text-sm text-gray-800 block">{data.date} {data.checkInTime || ''}</span>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN - Photo Only */}
          <div className="w-28 flex flex-col items-center gap-3">
            {/* Photo */}
            <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden border border-gray-300 shadow-sm print:border-gray-800">
               {data.photoUrl ? (
                 <img 
                   src={data.photoUrl} 
                   alt="Visitor" 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                   No Photo
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons - Hidden when printing */}
      <div className="mt-6 flex gap-4 print:hidden">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download / Print Pass
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-colors"
        >
          Back to Home
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            background-color: white;
          }
        }
      `}</style>
    </div>
  );
};

VirtualVisitorPass.propTypes = {
  visitor: PropTypes.shape({
    id: PropTypes.string,
    fullName: PropTypes.string,
    photoUrl: PropTypes.string,
    type: PropTypes.string,
    company: PropTypes.string,
    host: PropTypes.string,
    date: PropTypes.string,
    duration: PropTypes.string,
    status: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    idProof: PropTypes.string,
    checkInTime: PropTypes.string
  }),
};

export default VirtualVisitorPass;
