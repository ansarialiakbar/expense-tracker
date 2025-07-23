import { Routes, Route, Navigate } from 'react-router-dom';
     import Login from './components/Login';
     import Dashboard from './components/Dashboard';
     import AuditLogs from './components/AuditLogs';
     import { useState } from 'react';

     function App() {
       const [user, setUser] = useState(null);

       return (
         <div className="min-h-screen bg-gray-100">
           <Routes>
             <Route path="/login" element={<Login setUser={setUser} />} />
             <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
             <Route path="/audit" element={user?.role === 'admin' ? <AuditLogs /> : <Navigate to="/login" />} />
             <Route path="/" element={<Navigate to="/login" />} />
           </Routes>
         </div>
       );
     }

     export default App;