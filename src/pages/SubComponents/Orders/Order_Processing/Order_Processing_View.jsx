import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../component/button/Buttons';

const Order_Processing_View = () => {
  const navigate = useNavigate();

  // Mock data for the table
  const itemListData = [
    { id: 1, name: "Item name (category)", rol: 1250 },
    { id: 2, name: "Item name (category)", rol: 1250 },
    { id: 3, name: "Item name (category)", rol: 1250 },
    { id: 4, name: "Item name (category)", rol: 1250 },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-800"
    >
      <div className="">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
             <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#e0f2fe' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-3 text-[#0062a0] rounded-2xl transition-all cursor-pointer"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              View 124536
              <span className="text-sm font-medium px-6 py-1 border border-blue-400 text-blue-500 rounded-md">
                New
              </span>
            </h1>
          </div>
        </div>

        <hr className="border-slate-100 mb-10" />

        {/* --- INFO GRID SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8 mb-12">
          <InfoItem label="Customer" value="Sarah" />
          <InfoItem label="Order Date" value="24/02/2025" />
          <InfoItem label="Total Amount" value="₹25000" />
          <InfoItem label="Expected Due Date" value="30/02/2025" />
          <InfoItem label="Payment Status" value="Paid" />
          <InfoItem label="Status" value="New" />
        </div>

        {/* --- SHIPPING ADDRESS --- */}
        <div className="mb-14">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Shipping Address</h3>
          <p className="text-slate-800 leading-relaxed max-w-5xl font-medium">
            Lorem ipsum dolor sit amet consectetur. Lacus sit urna maecenas facilisi nullam et fringilla varius risus. Tristique
          </p>
        </div>

        {/* --- ITEM LIST TABLE --- */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Item List</h2>
          <div className="overflow-hidden border border-slate-300 rounded-sm shadow-sm overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-white border-b border-slate-300">
                  <th className="w-20 py-4 px-4 text-center text-sm font-bold border-r border-slate-300">s.no</th>
                  <th className="py-4 px-6 text-center text-sm font-bold border-r border-slate-300">Item List</th>
                  <th className="w-64 py-4 px-4 text-center text-sm font-bold">ROL</th>
                </tr>
              </thead>
              <tbody>
                {itemListData.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    variants={itemVariants}
                    className="border-b border-slate-300 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-5 px-4 text-center text-sm font-medium border-r border-slate-300">{item.id}</td>
                    <td className="py-5 px-6 text-center text-sm font-medium border-r border-slate-300">{item.name}</td>
                    <td className="py-5 px-4 text-center text-sm font-medium">{item.rol}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="flex justify-end mt-12 pb-10">
          <Button
          onClick={()=>navigate('../order-prcessing-create')}
          variant="primary"
          children="Edit"
          />
        </div>

      </div>
    </motion.div>
  );
};

// Reusable Sub-component for Info Items
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-slate-400">{label}</span>
    <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
  </div>
);

export default Order_Processing_View;