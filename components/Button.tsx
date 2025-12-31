import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100";
  
  const variants = {
    primary: "bg-cherry text-white shadow-lg shadow-pink-200 hover:bg-pink-600",
    secondary: "bg-gold text-gray-800 shadow-lg shadow-yellow-100 hover:bg-yellow-400",
    outline: "border-2 border-sky text-sky hover:bg-sky hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};