import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE_URL;

     const AuditLogs = () => {
       const [logs, setLogs] = useState([]);

       useEffect(() => {
         const fetchLogs = async () => {
           try {
             const { data } = await axios.get(`${API_BASE}/api/audit`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
             });
             setLogs(data);
           } catch (err) {
             alert(err.response.data.message);
           }
         };
         fetchLogs();
       }, []);

       return (
         <div className="p-8">
           <h1 className="text-3xl mb-4">Audit Logs</h1>
           <table className="w-full border-collapse">
             <thead>
               <tr className="bg-gray-200">
                 <th className="p-2">Action</th>
                 <th className="p-2">User Email</th>
                 <th className="p-2">Details</th>
                 <th className="p-2">Timestamp</th>
               </tr>
             </thead>
             <tbody>
               {logs.map(log => (
                 <tr key={log._id} className="border-t">
                   <td className="p-2">{log.action}</td>
                   <td className="p-2">{log.userId.email}</td>
                   <td className="p-2">{log.details}</td>
                   <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       );
     };

     export default AuditLogs;