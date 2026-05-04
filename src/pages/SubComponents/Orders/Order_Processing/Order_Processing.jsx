import { AnimatePresence, motion } from "framer-motion"; // Added Framer Motion
import { ShoppingCart, SquareKanban, UserRoundX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { order_processing_allGet } from "../../../../service/Orders_Services/Oreder_Services";
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import { useDispatch, useSelector } from "react-redux";

const Order_Processing = () => {
  const navigate = useNavigate();
  const [succesModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [DeleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tabledata, setTableData] = useState([]);
  console.log(tabledata, "tabledata")

           const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[7] || {};
  console.log("Permissions in User Master:", userPermissions);
  
  // Define permission checks
   const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // --- SMOOTHNESS VARIANTS (Matched with Editor style) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  useEffect(() => {
    if (DeleteSuccess) {
      setConfirmModel(false);
      const time = setTimeout(() => {
        setDeleteSuccess(false);
      }, 2000);
      return () => clearTimeout(time);
    }
  }, [DeleteSuccess]);


  const handleSelectionChange = (selectedIds) => {
    setSelectedRows(selectedIds);
  };

  const handleToggleStatus = (selectedRow) => {
    setData(prev => prev.map(row => 
      row.id === selectedRow.id ? { ...row, isActive: !row.isActive } : row
    ));
  };

  const handleEdit = (row) => navigate('order-prcessing-create', { state: { rowID: row.id } });
  const handleDelete = () => setConfirmModel(true);
  const handleView = (row) => navigate('order-Processing-view', { state: { rowId: row.id } });

  useEffect(() => {
    if (succesModel) {
      const timer = setTimeout(() => setSuccessModel(false), 2000);
      return () => clearTimeout(timer); 
    }
  }, [succesModel]);

  const StatsData = [
    { title: "Total Order Processing", count: "500", footerText: "OverAll", icon: <Users /> },
    { title: "Total Bin", count: "600", footerText: "OverAll", icon: <ShoppingCart /> },
    { title: "Total Project", count: "400", footerText: "OverAll", icon: <SquareKanban /> },
    { title: "Reorder Stock", count: "500", footerText: "OverAll", icon: <UserRoundX /> },
  ];
  
  const columns = [
    { header: 'Order Number', key: 'orderId' },
    { header: 'Customer', key: 'customerName', isCustomer: true },
    // { header: 'Total Amount', key: 'amount' },
    { header: 'Status', key: 'status', isStatus: true },
    { header: 'Payment Status', key: 'payment', isPaid: true },
    { header: 'Bin Status', key: 'qtyValue', isQtyIndicator: true },
  ];

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const res = await order_processing_allGet();
        const orders = res?.data?.data?.orders || [];

const processedOrders = orders.map((order, index) => {
  const totalAmount = order?.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    id: order._id,
    orderId: order.orderId,
    customerName: order?.customerId?.companyName || "-",
    amount: `₹ ${totalAmount.toLocaleString()}`,

    status:
      order.orderStatus === 1
        ? "Confirmed"
        : order.orderStatus === 2
        ? "Processing"
        : order.orderStatus === 3
        ? "Shipped"
        : "Pending",

    payment:
      order.paymentStatus === 1
        ? "Paid"
        : "Unpaid",

    qtyValue: order?.items?.length || 0,
  };
});

setTableData(processedOrders);
      }catch(err){
        console.log(err)
      }
    }
    fetchData();
  },[])

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[#fcfdfe] min-h-screen" // Changed to premium clean background
    >
      <div className="">
        
        {/* 1. Page Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Order <span className="text-[#0062a0]">Processing</span> </h1>
            <p className="text-[#0062a0] font-medium mt-1">Order Management System</p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button disabled={!canCreate}
                onClick={() => navigate('order-prcessing-create')}
                variant="primary"
              >
                + Order Processing
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} />
            </motion.div>
          </div>
        </motion.div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard
                title={item.title}
                count={item.count}
                footerText={item.footerText}
                icon={item.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* 3. Search and Table Container */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Search Bar Wrapper */}
          <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
            <div className="max-w-md w-full">
              <SearchBar />
            </div>
            
            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-blue-50 px-4 py-2 rounded-full"
                >
                  <span className="text-sm font-semibold text-[#0062a0]">
                    {selectedRows.length} Items Selected
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table Wrapper */}
          <div className="p-2">
            <ReUsable_Table
              columns={columns} 
              data={tabledata}
              showStatusBadge={true} 
              showPaidBadge={true}   
              showToggle={false}
              showQtyStatus={false}   
              showActions={true}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              onEdit={canEdit? handleEdit: undefined}
              onDelete={canDelete? handleDelete: undefined}
              onView={canView? handleView: undefined}
              onStatusToggle={handleToggleStatus}
              onRowClick={canView? (row) => navigate('order-Processing-view', { state: { rowId: row.id } }): undefined}
            />
          </div>
        </motion.div>
      </div>

      {/* Popups */}
      <Success_Popup
        isOpen={succesModel}
        onClose={() => setSuccessModel(false)}
        message="File Downloaded Successfully!"
      />
      <Confirmation_Popup
        isOpen={confirmModel}
        onClose={() => setConfirmModel(false)}
        onConfirm={() => setDeleteSuccess(true)}
        message="Are you sure you want to delete this row?"
      />
      <Success_Popup
        isOpen={DeleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Row Deleted Successfully!"
      />
    </motion.div>
  );
};

export default Order_Processing;