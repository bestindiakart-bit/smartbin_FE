import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../component/button/Buttons';
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from '../../../../component/ReUsableInput_Fields/ReUsableInput_Fields';

const Order_Processing_Create = () => {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [successModel, setSuccessModel] = useState(false);

  const [formData, setFormData] = useState({
    orderNumber: '',
    customer: '',
    orderDate: '',
    status: '',
    totalAmount: '',
    expectedDueDate: '',
    paymentStatus: '',
    shippingAddress: '',
  });

  // State for Dynamic Item Rows
  const [items, setItems] = useState([{ itemName: '', rol: '' }]);

  useEffect(() => {
    if (successModel) {
      const timer = setTimeout(() => {
        setSuccessModel(false);
        setConfirm(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModel]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { itemName: '', rol: '' }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50/20 p-4 md:p-8"
    >
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">
        
        {/* --- HEADER SECTION --- */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl transition-all active:scale-90 cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
              Create Order processing
            </h1>
          </div>
          
        </motion.div>

        {/* --- MAIN FORM GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Order Number"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              isActive={true} // Setting active to match the purple/highlighted border in image
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Customer"
              name="customer"
              type="select"
              placeholder=" "
              options={[{ label: 'Select Customer', value: '' }]}
              value={formData.customer}
              onChange={handleInputChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Order Date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleInputChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Status"
              name="status"
              type="select"
              placeholder=" "
              options={[{ label: 'Select Status', value: '' }]}
              value={formData.status}
              onChange={handleInputChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Total Amount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Expected Due Date"
              name="expectedDueDate"
              value={formData.expectedDueDate}
              onChange={handleInputChange}
            />
          </motion.div>
        </div>

        {/* --- FULL WIDTH FIELDS --- */}
        <motion.div variants={itemVariants}>
          <ReUsableInput_Fields
            label="Payment Status"
            name="paymentStatus"
            type="select"
            placeholder=" "
            options={[{ label: 'Paid', value: 'paid' }, { label: 'Unpaid', value: 'unpaid' }]}
            value={formData.paymentStatus}
            onChange={handleInputChange}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReUsableInput_Fields
            label="Shipping Address"
            name="shippingAddress"
            type="select"
            placeholder=" "
            options={[{ label: 'Address 1', value: '1' }]}
            value={formData.shippingAddress}
            onChange={handleInputChange}
          />
        </motion.div>

        {/* --- ADD ITEMS SECTION --- */}
        <motion.div variants={itemVariants} className="mt-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Add Items</h2>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col md:flex-row items-end md:items-center gap-4"
                >
                  <div className="flex-1 w-full">
                    <ReUsableInput_Fields
                      label="Item Name"
                      name="itemName"
                      type="select"
                      placeholder="Select Item"
                      className="!mt-0"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <ReUsableInput_Fields
                      label="ROL"
                      name="rol"
                      className="!mt-0"
                      value={item.rol}
                      onChange={(e) => handleItemChange(index, e)}
                    />
                  </div>
                  
                  {/* Action Buttons styled as per image */}
                  <div className="flex gap-2">
                    {index === items.length - 1 ? (
                       <button 
                        onClick={addRow}
                        className="bg-[#e6f4ff] text-[#0062a0] p-3 rounded-xl hover:bg-blue-100 transition-colors active:scale-90"
                      >
                        <Plus size={24} strokeWidth={3} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => removeRow(index)}
                        className="bg-[#e6f4ff] text-slate-800 p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors active:scale-90"
                      >
                        <Trash2 size={24} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* --- FOOTER BUTTONS --- */}
        <motion.div variants={itemVariants} className="flex items-center gap-6 justify-end mt-20 mb-4">
          <Button
            onClick={() => setConfirm(true)}
            variant="primary"
          >
            Create
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            Cancel
          </Button>
        </motion.div>
      </div>

      {/* MODALS */}
      <Confirmation_Popup
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setSuccessModel(true)}
        message="Are you sure you want to Create Order Processing?"
      />
      <Success_Popup
        isOpen={successModel}
        onClose={() => setSuccessModel(false)}
        message="Order Created Successfully!"
      />
    </motion.div>
  );
};

export default Order_Processing_Create;