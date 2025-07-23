import { useState } from 'react';
     import axios from 'axios';
     import { useNavigate } from 'react-router-dom';
     const API_BASE = process.env.REACT_APP_API_BASE_URL;
     console.log("API Base:", API_BASE);


     const Login = ({ setUser }) => {
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [role, setRole] = useState('employee');
       const [isRegister, setIsRegister] = useState(false);
       const navigate = useNavigate();

       const handleSubmit = async (e) => {
         e.preventDefault();
         try {
           const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
           const payload = isRegister ? { email, password, role } : { email, password };
           const { data } = await axios.post(`${API_BASE}${endpoint}`, payload);

           if (!isRegister) {
             localStorage.setItem('token', data.token);
             setUser({ role: data.role });
             navigate('/dashboard');
           } else {
             setIsRegister(false);
           }
         } catch (err) {
           alert(err.response.data.message);
         }
       };

       return (
         <div className="flex justify-center items-center h-screen">
           <div className="bg-white p-8 rounded shadow-md w-96">
             <h2 className="text-2xl mb-4">{isRegister ? 'Register' : 'Login'}</h2>
             <form onSubmit={handleSubmit}>
               <input
                 type="email"
                 placeholder="Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full p-2 mb-4 border rounded"
                 required
               />
               <input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full p-2 mb-4 border rounded"
                 required
               />
               {isRegister && (
                 <select
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full p-2 mb-4 border rounded"
                 >
                   <option value="employee">Employee</option>
                   <option value="admin">Admin</option>
                 </select>
               )}
               <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                 {isRegister ? 'Register' : 'Login'}
               </button>
             </form>
             <button
               onClick={() => setIsRegister(!isRegister)}
               className="mt-4 text-blue-500"
             >
               {isRegister ? 'Switch to Login' : 'Switch to Register'}
             </button>
           </div>
         </div>
       );
     };

     export default Login;