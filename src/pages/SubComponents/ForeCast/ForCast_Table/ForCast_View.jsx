import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, History, ArrowRight, User, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ForcastGet } from '../../../../store/Api_slice/Forecast_Slice';
import { fetchPermissions } from '../../../../store/Permission_Store/Permission_Slice';

const ForCast_View = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { permissions } = useSelector((state) => state.permissions);
  const userPermissions = permissions[10] || {};
  
  // Define permission checks
  const canView = userPermissions?.view || false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  const rowId = location.state?.rowId;
  const { forecastGet } = useSelector((state) => state.forecast);
  const [viewData, setViewData] = useState(null);

  // Fetch data if user accesses the view route directly / refreshes
  useEffect(() => {
    if (!forecastGet?.data) {
      dispatch(ForcastGet());
    }
  }, [dispatch, forecastGet]);

  // Extract the full specific Row Data based on rowId
  useEffect(() => {
    if (forecastGet?.data && rowId) {
      const targetData = forecastGet.data.find(item => item._id === rowId);
      setViewData(targetData);
    }
  }, [forecastGet, rowId]);

  if (!viewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <p className="text-gray-500 font-medium animate-pulse">Loading Forecast Details...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-800"
    >
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 text-[#0062a0] bg-white border border-gray-200 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Forecast Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{viewData.forecastId}</span> | {viewData.customerId?.companyName} | {viewData.projectId?.projectName}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[15px] text-gray-800 bg-[#f9fafc]">
                  <th className="py-4 px-6 font-semibold min-w-[140px]">Month</th>
                  <th className="py-4 px-6 font-semibold min-w-[180px]">Production</th>
                  <th className="py-4 px-6 font-semibold">Supply</th>
                  <th className="py-4 px-6 font-semibold min-w-[250px]">Item</th>
                  <th className="py-4 px-6 font-semibold">Required</th>
                  <th className="py-4 px-6 font-semibold">Total Cons</th>
                  <th className="py-4 px-6 font-semibold">Supplied Cons</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-gray-700">
                
                {viewData.projectForecast?.map((monthData, monthIdx) => {
                  // Map the API's actual itemConsumptions array
                  const itemsList = monthData.itemConsumptions ||[];

                  return itemsList.map((item, itemIdx) => (
                    <tr 
                      key={`${monthIdx}-${itemIdx}`} 
                      className={`hover:bg-gray-50/50 transition-colors ${itemIdx !== 0 ? 'border-none' : 'border-t border-gray-200'}`}
                    >
                      {/* 1. Month Column */}
                      <td className="py-4 px-6 align-top">
                        {itemIdx === 0 && (
                           <div className="flex flex-col gap-3 mt-1">
                             <span className="text-gray-800 font-medium whitespace-nowrap">
                               {monthData.forecastMonth}
                             </span>
                           </div>
                        )}
                      </td>

                      {/* 2. Parent Production with Update History Dropdown */}
                      <td className="py-4 px-6 align-top">
                        {itemIdx === 0 ? (
                          <div className="mt-1 flex items-center gap-3">
                            <span className="font-semibold text-slate-800 text-[15px]">
                              {monthData.productionQuantity ?? 0}
                            </span>

                            {/* Dropdown History Trigger */}
                            {monthData.productionHistory && monthData.productionHistory.length > 0 && (
                              <div className="relative group cursor-pointer">
                                <div className="flex items-center gap-1 text-xs font-medium text-[#0062a0] bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
                                  <History size={13} />
                                  <span>Edited ({monthData.productionHistory.length})</span>
                                </div>
                                
                                {/* Dropdown Panel */}
                                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 rounded-t-xl flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Update History</span>
                                  </div>
                                  <div className="max-h-[250px] overflow-y-auto p-1">
                                    
                                    {/* Map through history array */}
                                    {monthData.productionHistory.map((hist, hIdx) => {
                                      
                                      // Safely extract updater details (Supports populated object, string ID, or null)
                                      const updaterName = hist.updatedBy?.name || hist.updatedBy?.userName || 
                                        (typeof hist.updatedBy === 'string' ? `User ID: ${hist.updatedBy.substring(0, 8)}...` : 'System / Unknown');

                                      return (
                                        <div key={hIdx} className="p-3 hover:bg-slate-50 rounded-lg transition-colors border-b last:border-0 border-slate-50">
                                          
                                          {/* Date & Time */}
                                          <div className="text-[11px] text-slate-400 mb-2 flex justify-between items-center">
                                            <span className="flex items-center gap-1.5">
                                              <Calendar size={12} />
                                              {new Date(hist.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                              <Clock size={12} />
                                              {new Date(hist.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>

                                          {/* Updated By (User Info) */}
                                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100/60 w-fit px-2 py-0.5 rounded-full mb-2.5 border border-slate-200/60">
                                            <User size={10} className="text-slate-400" />
                                            <span className="font-medium">{updaterName}</span>
                                          </div>

                                          {/* Value Changes */}
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-slate-400 line-through decoration-slate-300 font-medium">
                                                {hist.oldValue}
                                              </span>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-300" />
                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                              {hist.newValue}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : ""}
                      </td>

                      {/* 3. Parent Supply */}
                      <td className="py-4 px-6 text-gray-600 align-top">
                        {itemIdx === 0 ? <div className="mt-1">{monthData.supplyQuantity ?? 0}</div> : ""}
                      </td>

                      {/* 4. Item Name */}
                      <td className="py-4 px-6 text-gray-700 align-top">
                        <div className="mt-1">{item.itemId?.itemName || "-"}</div>
                      </td>
                      
                      {/* 5. Required Quantity */}
                      <td className="py-4 px-6 text-gray-700 align-top">
                        <div className="mt-1">{item.requiredQuantity ?? 0}</div>
                      </td>

                      {/* 6. Total Consumption */}
                      <td className="py-4 px-6 text-gray-700 align-top">
                        <div className="mt-1">{item.totalConsumption ?? 0}</div>
                      </td>
                      
                      {/* 7. Supplied Consumption */}
                      <td className="py-4 px-6 text-gray-700 align-top">
                        <div className="mt-1">{item.suppliedConsumption ?? 0}</div>
                      </td>
                    </tr>
                  ));
                })}

                {/* Empty State Fallback */}
                {(!viewData.projectForecast || viewData.projectForecast.length === 0) && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      No monthly forecast data available for this record.
                    </td>
                  </tr>
                )}
                
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForCast_View;