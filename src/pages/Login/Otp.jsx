// import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Button from '../../component/button/Buttons';
// import ErrorMessage_Popup from '../../component/Popup_Models/ErrorMessage_Popup';
// import Success_Popup from '../../component/Popup_Models/Success_Popup';
// import PreLoader from "../../component/Pre_Loader/PreLoader";
// import { user_verify } from '../../service/Login/Login';
// import AuthLayout from './AuthLayout';
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPermissions } from "../../store/Permission_Store/Permission_Slice";

// const Otp = () => {
//   const navigate = useNavigate();
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const inputRefs = useRef([]);
//   const [showLoader, setShowLoader] = useState(false);
//   const { permissions } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   // Popup States
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [showError, setShowError] = useState(false);
//   const [popupMessage, setPopupMessage] = useState('');
//   const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
//   const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);

//   useEffect(() => {
//     const storedEmail = localStorage.getItem('temp_login_email');
//     if (storedEmail) {
//       setEmail(storedEmail);
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

//   // Watch for permissions data after successful fetch
//   useEffect(() => {
//     if (permissions?.data && !isPermissionsLoading) {
//       console.log("Permissions loaded successfully:", permissions.data);
//       // Navigate after permissions are loaded
//       setTimeout(() => {
//         setShowLoader(false);
//         if (isFirstTimeUser) {
//           navigate('/first-time-login');
//         } else {
//           navigate('/dashboard');
//         }
//       }, 500);
//     }
//   }, [permissions, isPermissionsLoading, isFirstTimeUser, navigate]);

//   const handleSubmit = async (e, autoSubmitOtp = null) => {
//     if (e) e.preventDefault();
//     const otpValue = autoSubmitOtp || otp.join('');
    
//     if (otpValue.length < 6) {
//       setPopupMessage("Please enter the full 6-digit code.");
//       setShowError(true);
//       return;
//     }

//     setLoading(true);
//     const payload = {
//       loginEmail: email,
//       otp: otpValue 
//     };

//     try {
//       const response = await user_verify(payload);
      
//       const successMsg = 
//         response?.data?.data?.message || 
//         response?.data?.message || 
//         response?.message ||
//         "Verification successful!";

//       const apiData = response?.data?.data || response?.data || response;

//       if (apiData?.accessToken) {
//         localStorage.setItem('accessToken', apiData.accessToken);
//         localStorage.setItem('email', email);
        
//         // Store user info if available
//         if (apiData?.user) {
//           localStorage.setItem('user', JSON.stringify(apiData.user));
//         }
//         if (apiData?.userId) {
//           localStorage.setItem('userId', apiData.userId);
//         }
//         if (apiData?.role) {
//           localStorage.setItem('role', apiData.role);
//         }
//       }

//       setIsFirstTimeUser(apiData?.isFirstLogin === true);
//       setPopupMessage(successMsg);
//       setShowSuccess(true);

//       // Close success popup and start loading permissions
//       setTimeout(async () => {
//         setShowSuccess(false);
//         setShowLoader(true);
        
//         // Fetch permissions after successful OTP verification
//         setIsPermissionsLoading(true);
//         try {
//           await dispatch(fetchPermissions()).unwrap();
//           console.log("Permissions API called successfully");
//         } catch (error) {
//           console.error("Failed to fetch permissions:", error);
//           // Still navigate even if permissions fail
//           setShowLoader(false);
//           if (isFirstTimeUser) {
//             navigate('/first-time-login');
//           } else {
//             navigate('/dashboard');
//           }
//         } finally {
//           setIsPermissionsLoading(false);
//         }
//       }, 1500);
      
//       localStorage.removeItem('temp_login_email'); 

//     } catch (error) {
//       console.error("Verification Error:", error);
      
//       const errorMessage = 
//         error?.response?.data?.data?.message || 
//         error?.response?.data?.message || 
//         error?.data?.data?.message || 
//         error?.data?.message || 
//         error?.message || 
//         "Invalid OTP. Please try again.";

//       setPopupMessage(errorMessage);
//       setShowError(true);
//       setOtp(['', '', '', '', '', '']); 
//       if (inputRefs.current[0]) {
//         inputRefs.current[0].focus(); 
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (value, index) => {
//     if (isNaN(value)) return;
    
//     const newOtp = [...otp];
//     newOtp[index] = value.substring(value.length - 1); 
//     setOtp(newOtp);
    
//     if (value && index < 5) {
//       inputRefs.current[index + 1].focus();
//     }

//     const currentOtpString = newOtp.join('');
//     if (currentOtpString.length === 6 && !loading) {
//       handleSubmit(null, currentOtpString);
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
//     if (pasteData) {
//       const newOtp = [...otp];
//       for (let i = 0; i < 6; i++) {
//         newOtp[i] = pasteData[i] || '';
//       }
//       setOtp(newOtp);

//       if (pasteData.length === 6 && !loading) {
//         if (inputRefs.current[5]) {
//           inputRefs.current[5].blur(); 
//         }
//         handleSubmit(null, pasteData);
//       } else {
//         const nextEmptyIndex = pasteData.length < 6 ? pasteData.length : 5;
//         if (inputRefs.current[nextEmptyIndex]) {
//           inputRefs.current[nextEmptyIndex].focus();
//         }
//       }
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       if (inputRefs.current[index - 1]) {
//         inputRefs.current[index - 1].focus();
//       }
//     }
//   };

//   return (
//     <AuthLayout title="Verify OTP" subtitle={`We've sent a 6-digit code to ${email}`}>
//       <AnimatePresence>
//         {showLoader && (
//           <motion.div
//             key="otp-loader"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[999] bg-white"
//           >
//             <PreLoader />
//           </motion.div>
//         )}
//       </AnimatePresence>
//       <form onSubmit={(e) => handleSubmit(e)}>
//         <div className="flex justify-between gap-2 sm:gap-4 mt-10 mb-12">
//           {otp.map((digit, i) => (
//             <input 
//               key={i}
//               ref={(el) => (inputRefs.current[i] = el)}
//               type="text" 
//               inputMode="numeric"
//               maxLength="1"
//               value={digit}
//               onChange={(e) => handleChange(e.target.value, i)}
//               onKeyDown={(e) => handleKeyDown(e, i)}
//               onPaste={handlePaste} 
//               className="w-full h-12 sm:h-16 text-center text-2xl font-bold bg-blue-50/50 border-2 border-slate-200 rounded-2xl focus:border-[#0062a0] focus:ring-4 focus:ring-blue-100 outline-none transition-all"
//               disabled={loading} 
//               autoFocus={i === 0}
//             />
//           ))}
//         </div>
//         <Button variant="primary" type="submit" className="w-full py-4 rounded-xl font-bold" disabled={loading}>
//           {loading ? "Verifying..." : "Verify & Proceed"}
//         </Button>
//       </form>

//       {/* Success Popup */}
//       <Success_Popup 
//         isOpen={showSuccess} 
//         onClose={() => setShowSuccess(false)} 
//         message={popupMessage}
//       />

//       {/* Error Popup */}
//       <ErrorMessage_Popup 
//         isOpen={showError} 
//         onClose={() => setShowError(false)} 
//         title="Verification Failed"
//         message={popupMessage}
//         btnText="Try Again"
//       />
//     </AuthLayout>
//   );
// };

// export default Otp;



import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../component/button/Buttons';
import ErrorMessage_Popup from '../../component/Popup_Models/ErrorMessage_Popup';
import Success_Popup from '../../component/Popup_Models/Success_Popup';
import PreLoader from "../../component/Pre_Loader/PreLoader";
import { user_verify } from '../../service/Login/Login';
import AuthLayout from './AuthLayout';
import { useDispatch } from "react-redux";
import { fetchPermissions } from "../../store/Permission_Store/Permission_Slice";

const Otp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const [showLoader, setShowLoader] = useState(false);

  // Popup States
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('temp_login_email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e, autoSubmitOtp = null) => {
    if (e) e.preventDefault();

    const otpValue = autoSubmitOtp || otp.join('');

    if (otpValue.length < 6) {
      setPopupMessage("Please enter the full 6-digit code.");
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await user_verify({
        loginEmail: email,
        otp: otpValue
      });

      const apiData = response?.data?.data || response?.data || response;

      const successMsg =
        response?.data?.data?.message ||
        response?.data?.message ||
        "Verification successful!";

      // ✅ Store auth data
      if (apiData?.accessToken) {
        localStorage.setItem('accessToken', apiData.accessToken);
        localStorage.setItem('email', email);
      }

      if (apiData?.user) {
        localStorage.setItem('user', JSON.stringify(apiData.user));
      }

      if (apiData?.userId) {
        localStorage.setItem('userId', apiData.userId);
      }

      if (apiData?.role) {
        localStorage.setItem('role', apiData.role);
      }

      const firstTime = apiData?.isFirstLogin === true;
      setIsFirstTimeUser(firstTime);

      setPopupMessage(successMsg);
      setShowSuccess(true);

      // ✅ After success popup → fetch permissions → navigate
      setTimeout(async () => {
        setShowSuccess(false);
        setShowLoader(true);

        try {
          await dispatch(fetchPermissions()).unwrap();
          console.log("Permissions API success");
        } catch (error) {
          console.error("Permissions failed:", error);
        }

        // ✅ Always navigate (even if permissions fail)
        setShowLoader(false);

        if (firstTime) {
          navigate('/first-time-login');
        } else {
          navigate('/dashboard');
        }

      }, 1500);

      localStorage.removeItem('temp_login_email');

    } catch (error) {
      console.error("Verification Error:", error);

      const errorMessage =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Invalid OTP. Please try again.";

      setPopupMessage(errorMessage);
      setShowError(true);
      setOtp(['', '', '', '', '', '']);

      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.join('').length === 6 && !loading) {
      handleSubmit(null, newOtp.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || '';
      }
      setOtp(newOtp);

      if (pasteData.length === 6 && !loading) {
        inputRefs.current[5]?.blur();
        handleSubmit(null, pasteData);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`We've sent a 6-digit code to ${email}`}>
      
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="otp-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-white"
          >
            <PreLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="flex justify-between gap-2 sm:gap-4 mt-10 mb-12">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className="w-full h-12 sm:h-16 text-center text-2xl font-bold bg-blue-50/50 border-2 border-slate-200 rounded-2xl focus:border-[#0062a0] focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              disabled={loading}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full py-4 rounded-xl font-bold"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify & Proceed"}
        </Button>
      </form>

      <Success_Popup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={popupMessage}
      />

      <ErrorMessage_Popup
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Verification Failed"
        message={popupMessage}
        btnText="Try Again"
      />
    </AuthLayout>
  );
};

export default Otp;