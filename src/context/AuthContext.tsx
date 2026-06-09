// // // import React, { createContext, useState, useContext, useEffect } from 'react';
// // // import { User, UserRole, AuthContextType } from '../types';
// // // import toast from 'react-hot-toast';

// // // // Create Auth Context
// // // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // // Local storage keys
// // // const USER_STORAGE_KEY = 'business_nexus_user';
// // // const TOKEN_STORAGE_KEY = 'business_nexus_token';

// // // // Auth Provider Component
// // // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// // //   const [user, setUser] = useState<User | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);

// // //   // Check for stored user on initial load
// // //   useEffect(() => {
// // //     const storedUser = localStorage.getItem(USER_STORAGE_KEY);
// // //     const token = localStorage.getItem(TOKEN_STORAGE_KEY);

// // //     if (storedUser && token) {
// // //       try {
// // //         const parsedUser = JSON.parse(storedUser);
// // //         setUser(parsedUser);
// // //       } catch (e) {
// // //         console.error('Failed to parse stored user:', e);
// // //         localStorage.removeItem(USER_STORAGE_KEY);
// // //       }
// // //     }
// // //     setIsLoading(false);
// // //   }, []);

// // //   // Login function - calls real backend API
// // //   const login = async (email: string, password: string, role: UserRole): Promise<void> => {
// // //     setIsLoading(true);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/api/auth/login", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json"
// // //         },
// // //         body: JSON.stringify({ email, password })
// // //       });

// // //       const data = await response.json();

// // //       if (!response.ok) {
// // //         throw new Error(data.message || "Login failed");
// // //       }

// // //       // Save user + token
// // //       setUser(data.user);
// // //       localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
// // //       localStorage.setItem(TOKEN_STORAGE_KEY, data.token);

// // //       toast.success("Login successful!");
// // //     } catch (error) {
// // //       toast.error((error as Error).message);
// // //       throw error;
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   // Register function - calls real backend API
// // //   const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
// // //     setIsLoading(true);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/api/auth/register", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json"
// // //         },
// // //         body: JSON.stringify({ name, email, password, role })
// // //       });

// // //       const data = await response.json();

// // //       if (!response.ok) {
// // //         throw new Error(data.message || "Registration failed");
// // //       }

// // //       // Save user + token
// // //       setUser(data.user);
// // //       localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
// // //       localStorage.setItem(TOKEN_STORAGE_KEY, data.token);

// // //       toast.success("Account created successfully!");
// // //     } catch (error) {
// // //       toast.error((error as Error).message);
// // //       throw error;
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   // Logout function
// // //   const logout = (): void => {
// // //     setUser(null);
// // //     localStorage.removeItem(USER_STORAGE_KEY);
// // //     localStorage.removeItem(TOKEN_STORAGE_KEY);
// // //     toast.success('Logged out successfully');
// // //   };

// // //   // Update user profile
// // //   const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
// // //     try {
// // //       const token = localStorage.getItem(TOKEN_STORAGE_KEY);
// // //       if (!token) {
// // //         throw new Error('Not authenticated');
// // //       }

// // //       const response = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
// // //         method: "PUT",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           "Authorization": `Bearer ${token}`
// // //         },
// // //         body: JSON.stringify(updates)
// // //       });

// // //       const data = await response.json();

// // //       if (!response.ok) {
// // //         throw new Error(data.message || "Profile update failed");
// // //       }

// // //       // Update current user if it's the same user
// // //       if (user?.id === userId) {
// // //         setUser(data.user);
// // //         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
// // //       }

// // //       toast.success('Profile updated successfully');
// // //     } catch (error) {
// // //       toast.error((error as Error).message);
// // //       throw error;
// // //     }
// // //   };

// // //   const value = {
// // //     user,
// // //     login,
// // //     register,
// // //     logout,
// // //     updateProfile,
// // //     isAuthenticated: !!user,
// // //     isLoading
// // //   };

// // //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // // };

// // // // Custom hook for using auth context
// // // export const useAuth = (): AuthContextType => {
// // //   const context = useContext(AuthContext);
// // //   if (context === undefined) {
// // //     throw new Error('useAuth must be used within an AuthProvider');
// // //   }
// // //   return context;
// // // };





// // import React, { createContext, useState, useContext, useEffect } from 'react';
// // import { User, UserRole, AuthContextType } from '../types';
// // import toast from 'react-hot-toast';

// // // Create Auth Context
// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // Local storage keys
// // const USER_STORAGE_KEY = 'business_nexus_user';
// // const TOKEN_STORAGE_KEY = 'business_nexus_token';

// // // Auth Provider Component
// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);

// //   // Load user from localStorage on app start
// //   useEffect(() => {
// //     const storedUser = localStorage.getItem(USER_STORAGE_KEY);
// //     const token = localStorage.getItem(TOKEN_STORAGE_KEY);

// //     if (storedUser && token) {
// //       try {
// //         setUser(JSON.parse(storedUser));
// //       } catch (e) {
// //         console.error("Invalid stored user");
// //         localStorage.removeItem(USER_STORAGE_KEY);
// //         localStorage.removeItem(TOKEN_STORAGE_KEY);
// //       }
// //     }

// //     setIsLoading(false);
// //   }, []);

// //   // LOGIN FUNCTION (FIXED)
// //   const login = async (
// //     email: string,
// //     password: string,
// //     role: UserRole
// //   ): Promise<void> => {
// //     setIsLoading(true);

// //     try {
// //       const response = await fetch("http://localhost:5000/api/auth/login", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email, password, role }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Login failed");
// //       }

// //       // ✅ SAVE TOKEN FIRST
// //       localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
// //       localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

// //       // ✅ SET USER STATE
// //       setUser(data.user);

// //       toast.success("Login successful!");
// //     } catch (error) {
// //       toast.error((error as Error).message);
// //       throw error;
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // REGISTER FUNCTION
// //   const register = async (
// //     name: string,
// //     email: string,
// //     password: string,
// //     role: UserRole
// //   ): Promise<void> => {
// //     setIsLoading(true);

// //     try {
// //       const response = await fetch("http://localhost:5000/api/auth/register", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ name, email, password, role }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Registration failed");
// //       }

// //       localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
// //       localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

// //       setUser(data.user);

// //       toast.success("Account created successfully!");
// //     } catch (error) {
// //       toast.error((error as Error).message);
// //       throw error;
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // LOGOUT FUNCTION
// //   const logout = (): void => {
// //     setUser(null);
// //     localStorage.removeItem(USER_STORAGE_KEY);
// //     localStorage.removeItem(TOKEN_STORAGE_KEY);
// //     toast.success("Logged out successfully");
// //   };

// //   // UPDATE PROFILE
// //   const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
// //     try {
// //       const token = localStorage.getItem(TOKEN_STORAGE_KEY);

// //       if (!token) {
// //         throw new Error("Not authenticated");
// //       }

// //       const response = await fetch(
// //         `http://localhost:5000/api/auth/profile/${userId}`,
// //         {
// //           method: "PUT",
// //           headers: {
// //             "Content-Type": "application/json",
// //             Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify(updates),
// //         }
// //       );

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Profile update failed");
// //       }

// //       if (user?.id === userId) {
// //         setUser(data.user);
// //         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
// //       }

// //       toast.success("Profile updated successfully");
// //     } catch (error) {
// //       toast.error((error as Error).message);
// //       throw error;
// //     }
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         login,
// //         register,
// //         logout,
// //         updateProfile,
// //         isAuthenticated: !!user,
// //         isLoading,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // // Hook
// // export const useAuth = (): AuthContextType => {
// //   const context = useContext(AuthContext);

// //   if (!context) {
// //     throw new Error("useAuth must be used within AuthProvider");
// //   }

// //   return context;
// // };






// import React, { createContext, useState, useContext, useEffect } from "react";
// import toast from "react-hot-toast";
// import { User, UserRole, AuthContextType } from "../types";

// // Create Context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Keys
// const USER_KEY = "business_nexus_user";
// const TOKEN_KEY = "business_nexus_token";

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Load user on refresh
//   useEffect(() => {
//     const storedUser = localStorage.getItem(USER_KEY);
//     const token = localStorage.getItem(TOKEN_KEY);

//     if (storedUser && token) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         localStorage.removeItem(USER_KEY);
//         localStorage.removeItem(TOKEN_KEY);
//       }
//     }

//     setIsLoading(false);
//   }, []);

//   // LOGIN
//   const login = async (
//     email: string,
//     password: string,
//     role: UserRole
//   ): Promise<void> => {
//     setIsLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password, role }),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Login failed");

//       localStorage.setItem(TOKEN_KEY, data.token);
//       localStorage.setItem(USER_KEY, JSON.stringify(data.user));

//       setUser(data.user);

//       toast.success("Login successful");
//     } catch (err) {
//       toast.error((err as Error).message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // REGISTER
//   const register = async (
//     name: string,
//     email: string,
//     password: string,
//     role: UserRole
//   ): Promise<void> => {
//     setIsLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name, email, password, role }),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Register failed");

//       localStorage.setItem(TOKEN_KEY, data.token);
//       localStorage.setItem(USER_KEY, JSON.stringify(data.user));

//       setUser(data.user);

//       toast.success("Account created");
//     } catch (err) {
//       toast.error((err as Error).message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // LOGOUT
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem(USER_KEY);
//     localStorage.removeItem(TOKEN_KEY);
//     toast.success("Logged out");
//   };

//   // UPDATE PROFILE
//   const updateProfile = async (userId: string, updates: Partial<User>) => {
//     try {
//       const token = localStorage.getItem(TOKEN_KEY);

//       if (!token) throw new Error("Not authenticated");

//       const res = await fetch(
//         `http://localhost:5000/api/auth/profile/${userId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(updates),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Update failed");

//       setUser(data.user);
//       localStorage.setItem(USER_KEY, JSON.stringify(data.user));

//       toast.success("Profile updated");
//     } catch (err) {
//       toast.error((err as Error).message);
//       throw err;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         login,
//         register,
//         logout,
//         updateProfile,
//         isAuthenticated: !!user,
//         isLoading,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook
// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }

//   return context;
// };



import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { User, UserRole, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "business_nexus_user";
const TOKEN_KEY = "business_nexus_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // LOAD USER
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // LOGIN
  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setUser(data.user);

      toast.success("Login successful");
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Register failed");

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setUser(data.user);

      toast.success("Account created");
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    toast.success("Logged out");
  };

  // UPDATE PROFILE
  const updateProfile = async (userId: string, updates: Partial<User>) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) throw new Error("Not authenticated");

    const res = await fetch(
      `http://localhost:5000/api/auth/profile/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Update failed");

    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    toast.success("Profile updated");
  };

  // ✅ REQUIRED (ADD THESE TWO EMPTY FUNCTIONS)
  const forgotPassword = async (email: string): Promise<void> => {
    toast("Forgot password feature not implemented yet");
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    toast("Reset password feature not implemented yet");
  };

  // FINAL VALUE (FIXED TYPE ERROR)
  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};