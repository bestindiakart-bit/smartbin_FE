// import { Eye, EyeOff } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import Select from 'react-select';

// const ReUsableInput_Fields = ({
//   type = "text",
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   options = [],
//   labelKey = "label",
//   valueKey = "value",
//   apiEndpoint = null,
//   error: externalError,
//   isActive = false, // External active state
//   required = false,
//   className = "",
//   disabled = false,
//   // New props
//   passwordValidation = false, // Enable password validation
//   searchable = false,         // Enable searchable select (only for type="select")
// }) => {
//   // Existing states
//   const [dynamicOptions, setDynamicOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isFocused, setIsFocused] = useState(false);

//   // New states for searchable select
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   // Internal password validation error
//   const [internalError, setInternalError] = useState('');

//   // Combine errors: external overrides internal
//   const error = externalError || internalError;

//   // Fetch options from API if needed
//   useEffect(() => {
//     if (apiEndpoint && type === "select") {
//       const fetchData = async () => {
//         setLoading(true);
//         try {
//           const response = await fetch(apiEndpoint);
//           const data = await response.json();
//           setDynamicOptions(data);
//         } catch (err) {
//           console.error("Input API Error:", err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchData();
//     }
//   }, [apiEndpoint, type]);

//   // Validate password when value changes (if enabled)
//   useEffect(() => {
//     if (type === "password" && passwordValidation) {
//       validatePassword(value);
//     } else {
//       // Clear internal error if validation disabled or type not password
//       setInternalError('');
//     }
//   }, [value, type, passwordValidation]);

//   const validatePassword = (pwd) => {
//     if (!pwd) {
//       setInternalError(required ? 'Password is required' : '');
//       return;
//     }
//     const minLength = 8;
//     const hasLower = /[a-z]/.test(pwd);
//     const hasUpper = /[A-Z]/.test(pwd);
//     const hasNumber = /[0-9]/.test(pwd);
//     const hasSpecial = /[!@#$%^&*]/.test(pwd);

//     if (pwd.length < minLength) {
//       setInternalError(`Password must be at least ${minLength} characters`);
//     } else if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
//       setInternalError('Password must contain at least one lowercase, one uppercase, one number, and one special character (!@#$%^&*)');
//     } else {
//       setInternalError('');
//     }
//   };

//   // Determine final options for select
//   const finalOptions = apiEndpoint ? dynamicOptions : options;

//   // Filter options for searchable select
//   const filteredOptions = finalOptions.filter(item => {
//     const label = item[labelKey] || item;
//     return label.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   // Handle option selection in searchable select
//   const handleSelectOption = (selectedValue) => {
//     // Create a synthetic event object to mimic native select
//     const event = {
//       target: {
//         name,
//         value: selectedValue,
//       },
//     };
//     onChange(event);
//     setIsOpen(false);
//     setSearchTerm('');
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Floating label logic
//   const isFloating = 
//     isFocused || 
//     (value !== undefined && value !== null && value.toString().length > 0) || 
//     type === "date" || 
//     type === "select" ||
//     isOpen || // Keep label up when dropdown is open
//     isActive;

//   const labelStyles = `absolute transition-all duration-200 pointer-events-none z-10 left-3 px-1.5 ${
//     isFloating 
//       ? "-top-2.5 text-[12px] bg-white"  // Top border position
//       : "top-1/2 -translate-y-1/2 text-[14px] bg-transparent" // Inside position
//   } ${
//     error ? "text-red-500 font-semibold" : (isFocused || isActive || isOpen) ? "text-[#0062a0]" : "text-gray-500"
//   }`;

//   const inputBaseStyles = `w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 outline-none bg-transparent ${
//     error 
//       ? "border-red-500" 
//       : (isFocused || isActive || isOpen) 
//         ? "border-[#0062a0] shadow-md shadow-blue-900/10 ring-1 ring-[#0062a0]/10" 
//         : "border-slate-300 hover:border-[#0062a0]/50 focus:border-[#0062a0]"
//   } ${disabled ? "bg-gray-50 cursor-not-allowed opacity-70" : ""}`;

//   return (
//     <div className={`relative mt-5 mb-1.5 w-full ${className}`} ref={type === "select" && searchable ? dropdownRef : null}>
//       {/* Floating Label */}
//       {label && (
//         <label className={labelStyles}>
//           {label.toUpperCase()} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}

//       <div className="relative flex items-center">
//         {type === "select" ? (
//   <div className="w-full">
//     <Select
//       options={options}
//       value={options.find((opt) => opt.value === value) || null}
//       onChange={(selected) =>
//         onChange({
//           target: {
//             name,
//             value: selected ? selected.value : "",
//           },
//         })
//       }
//       isDisabled={disabled || loading}
//       isLoading={loading}
//       placeholder={placeholder}
//       isSearchable
//       className="text-sm"
//       styles={{
//         control: (base, state) => ({
//           ...base,
//           minHeight: "42px",
//           borderRadius: "0.5rem",
//           borderColor: state.isFocused ? "#0062a0" : "#e5e7eb",
//           boxShadow: state.isFocused
//             ? "0 0 0 2px rgba(0,98,160,0.2)"
//             : "none",
//           "&:hover": {
//             borderColor: "#0062a0",
//           },
//         }),
//         menu: (base) => ({
//           ...base,
//           zIndex: 9999,
//         }),
//       }}
//     />
//   </div>
// ) : type === "textarea" ? (
//           <textarea
//             name={name}
//             value={value}
//             onChange={onChange}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             disabled={disabled}
//             placeholder={isFocused ? placeholder : ""}
//             className={`${inputBaseStyles} min-h-[100px] py-2.5 resize-none`}
//           />
//         ) : (
//           // ---------- Input (text, password, etc.) ----------
//           <div className="relative w-full">
//             <input
//               type={type === "password" ? (showPassword ? "text" : "password") : type}
//               name={name}
//               value={value}
//               onChange={onChange}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => setIsFocused(false)}
//               disabled={disabled}
//               placeholder={isFocused ? placeholder : ""}
//               className={inputBaseStyles}
//             />
//             {type === "password" && (
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0062a0] transition-colors"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Error message */}
//       {error && (
//         <p className="text-[10px] text-red-500 font-medium mt-1 ml-2 animate-in fade-in slide-in-from-top-1">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// export default ReUsableInput_Fields;

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import Select, { components } from "react-select";

/* =========================================================
   SMART BIN STATUS BADGE
========================================================= */
const SmartbinBadge = ({ value }) => {
  const isActive =
    value === true ||
    value === 1 ||
    value === "true" ||
    value === "1";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
        isActive
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
};

/* =========================================================
   CUSTOM DROPDOWN OPTION
========================================================= */
const CustomOption = (props) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full gap-3">
        <span className="text-sm text-slate-700 truncate">
          {data.label}
        </span>

        {data.badge && (
          <SmartbinBadge value={data.badge.value} />
        )}
      </div>
    </components.Option>
  );
};

/* =========================================================
   CUSTOM SELECTED VALUE
========================================================= */
const CustomSingleValue = (props) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2 w-full min-w-0">
        <span className="text-sm text-slate-700 truncate">
          {data.label}
        </span>

        {data.badge && (
          <SmartbinBadge value={data.badge.value} />
        )}
      </div>
    </components.SingleValue>
  );
};

/* =========================================================
   REUSABLE INPUT FIELDS
========================================================= */
const ReUsableInput_Fields = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  options = [],
  labelKey = "label",
  valueKey = "value",
  apiEndpoint = null,
  error: externalError,
  isActive = false,
  required = false,
  className = "",
  disabled = false,

  // Password validation
  passwordValidation = false,

  // Searchable select
  searchable = false,
}) => {
  /* =======================================================
     STATES
  ======================================================= */
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [internalError, setInternalError] = useState("");

  const error = externalError || internalError;

  /* =======================================================
     FETCH OPTIONS FROM API
  ======================================================= */
  useEffect(() => {
    if (apiEndpoint && type === "select") {
      const fetchData = async () => {
        setLoading(true);

        try {
          const response = await fetch(apiEndpoint);
          const data = await response.json();

          setDynamicOptions(
            Array.isArray(data) ? data : []
          );
        } catch (err) {
          console.error("Input API Error:", err);
          setDynamicOptions([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [apiEndpoint, type]);

  /* =======================================================
     PASSWORD VALIDATION
  ======================================================= */
  useEffect(() => {
    if (type === "password" && passwordValidation) {
      validatePassword(value);
    } else {
      setInternalError("");
    }
  }, [value, type, passwordValidation]);

  const validatePassword = (pwd) => {
    if (!pwd) {
      setInternalError(
        required ? "Password is required" : ""
      );
      return;
    }

    const minLength = 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);

    if (pwd.length < minLength) {
      setInternalError(
        `Password must be at least ${minLength} characters`
      );
    } else if (
      !hasLower ||
      !hasUpper ||
      !hasNumber ||
      !hasSpecial
    ) {
      setInternalError(
        "Password must contain at least one lowercase, one uppercase, one number, and one special character (!@#$%^&*)"
      );
    } else {
      setInternalError("");
    }
  };

  /* =======================================================
     FINAL OPTIONS
  ======================================================= */
  const finalOptions = apiEndpoint
    ? dynamicOptions
    : options;

  /* =======================================================
     SELECTED OPTION
  ======================================================= */
  const selectedOption =
    finalOptions.find(
      (option) =>
        String(option?.[valueKey] ?? "") ===
        String(value ?? "")
    ) || null;

  /* =======================================================
     FLOATING LABEL
  ======================================================= */
  const isFloating =
    isFocused ||
    (value !== undefined &&
      value !== null &&
      value.toString().length > 0) ||
    type === "date" ||
    type === "select" ||
    isActive;

  const labelStyles = `
    absolute
    transition-all
    duration-200
    pointer-events-none
    z-20
    left-3
    px-1.5
    ${
      isFloating
        ? "-top-2.5 text-[12px] bg-white"
        : "top-1/2 -translate-y-1/2 text-[14px] bg-transparent"
    }
    ${
      error
        ? "text-red-500 font-semibold"
        : isFocused || isActive
        ? "text-[#0062a0]"
        : "text-gray-500"
    }
  `;

  /* =======================================================
     INPUT STYLES
  ======================================================= */
  const inputBaseStyles = `
    w-full
    px-4
    py-2.5
    rounded-lg
    border
    text-sm
    transition-all
    duration-300
    outline-none
    bg-transparent
    ${
      error
        ? "border-red-500"
        : isFocused || isActive
        ? "border-[#0062a0] shadow-md shadow-blue-900/10 ring-1 ring-[#0062a0]/10"
        : "border-slate-300 hover:border-[#0062a0]/50 focus:border-[#0062a0]"
    }
    ${
      disabled
        ? "bg-gray-50 cursor-not-allowed opacity-70"
        : ""
    }
  `;

  /* =======================================================
     REACT SELECT STYLES
  ======================================================= */
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.5rem",
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "#0062a0"
        : "#cbd5e1",
      boxShadow: error
        ? "0 0 0 1px rgba(239,68,68,0.15)"
        : state.isFocused
        ? "0 0 0 2px rgba(0,98,160,0.15)"
        : "none",
      backgroundColor: disabled ? "#f8fafc" : "white",
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#0062a0",
      },
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "2px 12px",
    }),

    singleValue: (base) => ({
      ...base,
      margin: 0,
      maxWidth: "100%",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#94a3b8",
      fontSize: "14px",
    }),

    input: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#334155",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "0.75rem",
      overflow: "hidden",
      boxShadow:
        "0 10px 30px rgba(15, 23, 42, 0.15)",
      border: "1px solid #e2e8f0",
      marginTop: "4px",
    }),

    menuList: (base) => ({
      ...base,
      padding: "6px",
      maxHeight: "250px",
    }),

    option: (base, state) => ({
      ...base,
      padding: "10px 12px",
      borderRadius: "0.5rem",
      backgroundColor: state.isSelected
        ? "#e0f2fe"
        : state.isFocused
        ? "#f0f9ff"
        : "white",
      color: "#334155",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#e0f2fe",
      },
    }),

    noOptionsMessage: (base) => ({
      ...base,
      fontSize: "13px",
      color: "#64748b",
      padding: "12px",
    }),

    loadingMessage: (base) => ({
      ...base,
      fontSize: "13px",
      color: "#64748b",
    }),

    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#e2e8f0",
    }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? "#0062a0" : "#64748b",
      "&:hover": {
        color: "#0062a0",
      },
    }),
  };

  /* =======================================================
     RETURN
  ======================================================= */
  return (
    <div
      className={`relative mt-5 mb-1.5 w-full ${className}`}
    >
      {/* FLOATING LABEL */}
      {label && (
        <label className={labelStyles}>
          {label.toUpperCase()}{" "}
          {required && (
            <span className="text-red-500">*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {/* =================================================
            SELECT
        ================================================= */}
        {type === "select" ? (
          <div className="w-full">
            <Select
              options={finalOptions}
              value={selectedOption}
              isDisabled={disabled || loading}
              isLoading={loading}
              placeholder={placeholder}
              isSearchable={searchable !== false}
              getOptionLabel={(option) =>
                String(option?.[labelKey] ?? "")
              }
              getOptionValue={(option) =>
                String(option?.[valueKey] ?? "")
              }
              onChange={(selected) => {
                onChange({
                  target: {
                    name,
                    value: selected
                      ? selected[valueKey]
                      : "",
                  },
                });
              }}
              components={{
                Option: CustomOption,
                SingleValue: CustomSingleValue,
              }}
              styles={selectStyles}
              className="text-sm"
              classNamePrefix="reusable-select"
              noOptionsMessage={() => "No options found"}
              loadingMessage={() => "Loading..."}
            />
          </div>
        ) : type === "textarea" ? (
          /* =================================================
             TEXTAREA
          ================================================= */
          <textarea
            name={name}
            value={value ?? ""}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            className={`${inputBaseStyles} min-h-[100px] py-2.5 resize-none`}
          />
        ) : (
          /* =================================================
             NORMAL INPUT
          ================================================= */
          <div className="relative w-full">
            <input
              type={
                type === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              name={name}
              value={value ?? ""}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder={isFocused ? placeholder : ""}
              className={inputBaseStyles}
            />

            {type === "password" && (
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-[#0062a0]
                  transition-colors
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p
          className="
            text-[10px]
            text-red-500
            font-medium
            mt-1
            ml-2
            animate-in
            fade-in
            slide-in-from-top-1
          "
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default ReUsableInput_Fields;
