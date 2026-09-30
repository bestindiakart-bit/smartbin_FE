import { Search, X } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search ....",
  onClear,
  className = "",
}) => {
  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-[#0062a0] opacity-70" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-11 pr-10 py-1.5 bg-white border border-gray-200 
                   rounded-xl text-[#0062a0] placeholder:text-[#0062a0]/60 
                   focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0062a0] 
                   transition-all duration-200 shadow-sm font-medium"
      />

      {/* Clear Button (Shows only when there is text) */}
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0062a0] transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
