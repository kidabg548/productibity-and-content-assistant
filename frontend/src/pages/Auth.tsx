// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast';
// import GoogleAuthButton from '@/components/GoogleAuthButton';

// interface AuthFormData {
//     email: string;
//     password: string;
//     name?: string;
// }

// const Auth: React.FC = () => {
//     const [isLogin, setIsLogin] = useState(true);
//     const [formData, setFormData] = useState<AuthFormData>({
//         email: '',
//         password: '',
//         name: ''
//     });
//     const navigate = useNavigate();
//     const { toast } = useToast();

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             const endpoint = isLogin ? '/auth/login' : '/auth/register';
//             const response = await fetch(`http://localhost:3000${endpoint}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData),
//             });

//             if (!response.ok) {
//                 throw new Error(isLogin ? 'Login failed' : 'Registration failed');
//             }

//             const data = await response.json();
//             localStorage.setItem('token', data.token);
//             toast({
//                 title: 'Success',
//                 description: isLogin ? 'Logged in successfully!' : 'Registered successfully!',
//             });
//             navigate('/dashboard');
//         } catch (error) {
//             toast({
//                 title: 'Error',
//                 description: error instanceof Error ? error.message : 'Authentication failed',
//                 variant: 'destructive',
//             });
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                         {isLogin ? 'Sign in to your account' : 'Create your account'}
//                     </h2>
//                 </div>
//                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//                     <div className="rounded-md shadow-sm -space-y-px">
//                         {!isLogin && (
//                             <div>
//                                 <label htmlFor="name" className="sr-only">Name</label>
//                                 <input
//                                     id="name"
//                                     name="name"
//                                     type="text"
//                                     required={!isLogin}
//                                     className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                                     placeholder="Full Name"
//                                     value={formData.name}
//                                     onChange={handleInputChange}
//                                 />
//                             </div>
//                         )}
//                         <div>
//                             <label htmlFor="email" className="sr-only">Email address</label>
//                             <input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 required
//                                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                                 placeholder="Email address"
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="password" className="sr-only">Password</label>
//                             <input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 required
//                                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                                 placeholder="Password"
//                                 value={formData.password}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <Button
//                             type="submit"
//                             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                         >
//                             {isLogin ? 'Sign in' : 'Sign up'}
//                         </Button>
//                     </div>
//                 </form>

//                 <div className="mt-6">
//                     <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                             <div className="w-full border-t border-gray-300" />
//                         </div>
//                         <div className="relative flex justify-center text-sm">
//                             <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
//                         </div>
//                     </div>

//                     <div className="mt-6">
//                         <GoogleAuthButton onSuccess={() => navigate('/dashboard')} />
//                     </div>
//                 </div>

//                 <div className="text-center">
//                     <button
//                         type="button"
//                         className="text-sm text-indigo-600 hover:text-indigo-500"
//                         onClick={() => setIsLogin(!isLogin)}
//                     >
//                         {isLogin
//                             ? "Don't have an account? Sign up"
//                             : 'Already have an account? Sign in'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Auth; 