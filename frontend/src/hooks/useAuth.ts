import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, register, logout, initializeAuth } from '@/store/slices/authSlice';
import { LoginDto, RegisterDto } from '@/lib/api/auth.api';
import { Role } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleLogin = async (credentials: LoginDto) => {
    return dispatch(login(credentials)).unwrap();
  };

  const handleRegister = async (data: RegisterDto) => {
    return dispatch(register(data)).unwrap();
  };

  const handleLogout = async () => {
    return dispatch(logout()).unwrap();
  };

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([Role.SUPER_ADMIN, Role.ADMIN]);
  };

  const isInstructor = (): boolean => {
    return user?.role === Role.INSTRUCTOR;
  };

  const isStudent = (): boolean => {
    return user?.role === Role.STUDENT;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isInstructor,
    isStudent,
  };
};
