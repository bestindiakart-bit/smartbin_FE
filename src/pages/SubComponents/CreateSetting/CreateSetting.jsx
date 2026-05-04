import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, LayoutGrid, Plus, Settings2, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Project Components
import Button from '../../../component/button/Buttons';
import Confirmation_Popup from '../../../component/Popup_Models/Confirmation_Popup';
import Success_Popup from '../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from '../../../component/ReUsableInput_Fields/ReUsableInput_Fields';

// API Imports
import {
  customer_delete_Type,
  customer_get_Type,
  customer_patch_Type,
  customer_post_Type,
  item_category_create,
  item_category_delete,
  item_category_gets,
  item_category_patch,
  user_type_delete,
  user_type_get,
  user_type_patch,
  user_type_post
} from "../../../service/Master_Services/Master_Services";

const CreateSetting = () => {
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [categories, setCategories] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  // --- UI STATES ---
  const [modalState, setModalState] = useState({ open: false, mode: 'create', entity: '', data: null });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, id: null, entity: '' });
  const [successPopup, setSuccessPopup] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Initial Data Load
  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    fetchCategories();
    fetchCustomerTypes();
    fetchUserTypes();
  };

  // --- FETCHERS ---
  const fetchCategories = async () => {
    try {
      const res = await item_category_gets();
      setCategories(res?.data?.data?.records || []);
    } catch (err) { console.error("Category Fetch Error:", err); }
  };

  const fetchCustomerTypes = async () => {
    try {
      const res = await customer_get_Type();
      setCustomerTypes(res?.data?.data || []);
    } catch (err) { console.error("Customer Type Fetch Error:", err); }
  };

  const fetchUserTypes = async () => {
    try {
      const res = await user_type_get();
      setUserTypes(res?.data?.data || []);
    } catch (err) { console.error("User Type Fetch Error:", err); }
  };

  // --- MODAL HANDLERS ---
  const handleOpenModal = (mode, entity, data = null) => {
    setModalState({ open: true, mode, entity, data });
    if (data) {
      if (entity === 'category') setInputValue(data.categoryName);
      else if (entity === 'customerType') setInputValue(data.customerTypeName);
      else if (entity === 'userType') setInputValue(data.userTypeName);
    } else {
      setInputValue("");
    }
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'create', entity: '', data: null });
    setInputValue("");
  };

  // --- SAVE HANDLER ---
  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    try {
      let res;
      const isEdit = modalState.mode === 'edit';

      if (modalState.entity === 'category') {
        res = isEdit 
          ? await item_category_patch(modalState.data._id, { categoryName: inputValue })
          : await item_category_create({ categoryName: inputValue });
        await fetchCategories();
      } 
      else if (modalState.entity === 'customerType') {
        res = isEdit 
          ? await customer_patch_Type(modalState.data._id, { customerTypeName: inputValue })
          : await customer_post_Type({ customerTypeName: inputValue });
        await fetchCustomerTypes();
      }
      else if (modalState.entity === 'userType') {
        res = isEdit
          ? await user_type_patch(modalState.data._id, { userTypeName: inputValue })
          : await user_type_post({ userTypeName: inputValue });
        await fetchUserTypes();
      }

      if (res?.data?.success) {
        setSuccessPopup({ 
            open: true, 
            message: `Record ${isEdit ? 'updated' : 'created'} successfully!` 
        });
        handleCloseModal();
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    try {
      if (confirmPopup.entity === 'category') {
        await item_category_delete(confirmPopup.id);
        await fetchCategories();
      } 
      else if (confirmPopup.entity === 'customerType') {
        await customer_delete_Type(confirmPopup.id); 
        await fetchCustomerTypes();
      } 
      else if (confirmPopup.entity === 'userType') {
        await user_type_delete(confirmPopup.id);
        await fetchUserTypes();
      }
      
      setConfirmPopup({ open: false, id: null, entity: '' });
      setSuccessPopup({ open: true, message: "Deleted successfully!" });
    } catch (err) { 
      console.error("Delete Error:", err); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdff] p-4 md:p-8">
      <div className="max-w-full mx-auto">

        {/* Header Action */}
        <div className='flex items-center justify-end mb-6'>
          <Button 
            onClick={() => navigate('iot-create')}
            variant="primary"
          >
            <div className="flex items-center gap-2">
                <Plus size={18}/> 
                <span>Create IoT Config</span>
            </div>
          </Button>
        </div>
        
        {/* Page Title */}
        <div className="mb-10">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-[#0062a0] text-white rounded-xl shadow-lg shadow-blue-200">
                    <LayoutGrid size={28}/>
                </div>
                System <span className="text-[#0062a0]">Settings</span>
            </h1>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SectionCard 
            title="Item Categories" 
            icon={<Settings2 size={22}/>} 
            color="blue"
            onAdd={() => handleOpenModal('create', 'category')}
          >
            {categories.map((item) => (
              <ListItem 
                key={item._id} 
                label={item.categoryName} 
                onEdit={() => handleOpenModal('edit', 'category', item)}
                onDelete={() => setConfirmPopup({ open: true, id: item._id, entity: 'category' })}
              />
            ))}
          </SectionCard>

          <SectionCard 
            title="Customer Types" 
            icon={<Users size={22}/>} 
            color="indigo"
            onAdd={() => handleOpenModal('create', 'customerType')}
          >
            {customerTypes.map((item) => (
              <ListItem 
                key={item._id} 
                label={item.customerTypeName} 
                onEdit={() => handleOpenModal('edit', 'customerType', item)}
                onDelete={() => setConfirmPopup({ open: true, id: item._id, entity: 'customerType' })}
              />
            ))}
          </SectionCard>

          <SectionCard 
            title="User Roles" 
            icon={<ShieldCheck size={22}/>} 
            color="emerald"
            onAdd={() => handleOpenModal('create', 'userType')}
          >
            {userTypes.map((item) => (
              <ListItem 
                key={item._id} 
                label={item.userTypeName} 
                onEdit={() => handleOpenModal('edit', 'userType', item)}
                onDelete={() => setConfirmPopup({ open: true, id: item._id, entity: 'userType' })}
              />
            ))}
          </SectionCard>
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      <AnimatePresence>
        {modalState.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {modalState.mode === 'edit' ? 'Edit' : 'New'} {
                    modalState.entity === 'category' ? 'Category' : 
                    modalState.entity === 'userType' ? 'User Type' : 'Customer Type'
                  }
                </h3>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>
              
              <ReUsableInput_Fields 
                label="Label Name"
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder={`Enter name...`}
              />

              <div className="flex gap-3 justify-end mt-10">
                <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Processing..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Confirmation_Popup 
        isOpen={confirmPopup.open} 
        onClose={() => setConfirmPopup({ open: false, id: null, entity: '' })} 
        onConfirm={handleDelete} 
        message={`This will permanently remove this record. Continue?`}
      />
      
      <Success_Popup 
        isOpen={successPopup.open} 
        onClose={() => setSuccessPopup({ open: false, message: '' })} 
        message={successPopup.message} 
      />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SectionCard = ({ title, icon, color, onAdd, children }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-[#0062a0]',
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <motion.div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col h-[520px]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>{icon}</div>
          <h2 className="text-md font-bold text-slate-700 tracking-tight">{title}</h2>
        </div>
        <button 
          onClick={onAdd}
          className="p-2 bg-slate-900 text-white rounded-lg hover:bg-[#0062a0] transition-all"
        >
          <Plus size={18}/>
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {children && children.length > 0 ? children : (
          <div className="text-center py-20 text-slate-300 text-xs font-medium italic">Empty List</div>
        )}
      </div>
    </motion.div>
  );
};

const ListItem = ({ label, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all group">
    <span className="font-bold text-slate-600 text-[13px]">{label}</span>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
      <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={14}/></button>
      <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14}/></button>
    </div>
  </div>
);

export default CreateSetting;