// Onboarding Platform — React Components
// Design System: Editorial Luxury (Dark, Bold Typography, Generous Spacing)
// Built: Feb 19, 2026

import React from 'react';
import { Check, Clock } from 'lucide-react';

/**
 * COLOR PALETTE
 * Primary: Deep Charcoal (#1a1a1a)
 * Secondary: Navy Blue (#0f1a2f)
 * Accent: Cream/Off-white (#f5f3f0)
 * Success: Sage Green (#5a8c6f)
 * Warning: Copper (#b85c3c)
 * Info: Steel Blue (#4a7ba7)
 */

// ============================================================================
// CARD COMPONENT
// ============================================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white dark:bg-slate-900 
      border border-gray-200 dark:border-slate-700
      rounded-lg shadow-sm hover:shadow-md 
      transition-shadow duration-200
      p-6
      ${className}
    `}
  >
    {children}
  </div>
);

// ============================================================================
// BUTTON COMPONENT
// ============================================================================
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
}) => {
  const baseClass = `
    px-4 py-2.5 rounded-lg font-medium text-sm
    transition-all duration-150
    cursor-pointer flex items-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700',
    secondary: 'bg-gray-100 text-slate-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {loading ? <span className="animate-spin">⚙️</span> : icon}
      {label}
    </button>
  );
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================
interface InputProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
}) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2 border rounded-lg
        bg-white dark:bg-slate-800 text-slate-900 dark:text-white
        border-gray-300 dark:border-slate-600
        hover:border-gray-400 dark:hover:border-slate-500
        focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400
        transition-colors duration-150
        ${error ? 'border-red-500 focus:ring-red-500' : ''}
        ${className}
      `}
    />
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================
interface ProgressProps {
  value: number; // 0-100
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Progress: React.FC<ProgressProps> = ({ value, label, size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>}
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-600 dark:to-slate-500 transition-all duration-300"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{Math.round(value)}% complete</p>
    </div>
  );
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================
type BadgeStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const statusConfig = {
    pending: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-700 dark:text-gray-300', icon: '○' },
    in_progress: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: '◆' },
    completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', icon: '✓' },
    blocked: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', icon: '⚠' },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      <span>{config.icon}</span>
      {label || status.replace('_', ' ')}
    </span>
  );
};

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================
interface TaskCardProps {
  title: string;
  description?: string;
  status: BadgeStatus;
  dueDate?: string;
  assignee?: string;
  onClick?: () => void;
  order?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  status,
  dueDate,
  assignee,
  onClick,
  order,
}) => (
  <Card onClick={onClick} className="cursor-pointer hover:border-gray-400 dark:hover:border-slate-500">
    <div className="flex items-start gap-4">
      {/* Order indicator */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-900 dark:text-white">{order}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <Badge status={status} />
        </div>

        {description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          {dueDate && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{dueDate}</span>
            </div>
          )}
          {assignee && <div className="flex items-center gap-1">👤 {assignee}</div>}
        </div>
      </div>
    </div>
  </Card>
);

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================
interface TimelineStep {
  id: string;
  label: string;
  status: BadgeStatus;
  completedAt?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  currentStep?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, currentStep }) => (
  <div className="space-y-4">
    {steps.map((step, index) => {
      const isCompleted = step.status === 'completed';
      const isCurrent = step.id === currentStep;

      return (
        <div key={step.id} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-200
                ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'bg-gray-300 dark:bg-slate-600'
                }
              `}
            >
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-0.5 h-12 mt-2
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'}
                `}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-6">
            <p className="font-medium text-slate-900 dark:text-white">{step.label}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {step.completedAt ? `Completed ${step.completedAt}` : 'Pending'}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

// ============================================================================
// STAT CARD COMPONENT (Dashboard)
// ============================================================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>

        {trend && (
          <div className={`text-xs mt-2 font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last month
          </div>
        )}
      </div>

      {icon && <div className="text-gray-400 dark:text-gray-600">{icon}</div>}
    </div>
  </Card>
);

// ============================================================================
// HEADER COMPONENT
// ============================================================================
interface HeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PageHeader: React.FC<HeaderProps> = ({ title, description, action }) => (
  <div className="border-b border-gray-200 dark:border-slate-700 pb-6 mb-6">
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
      </div>

      {action && <Button label={action.label} onClick={action.onClick} />}
    </div>
  </div>
);

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    {icon && <div className="flex justify-center mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
    {action && <Button label={action.label} onClick={action.onClick} />}
  </div>
);

// ============================================================================
// MODAL COMPONENT
// ============================================================================
interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
        <div className="mb-6">{children}</div>

        <div className="flex gap-3 justify-end">
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          {action && <Button label={action.label} onClick={action.onClick} />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CLIENT PROFILE CARD (Onboarding View)
// ============================================================================
interface ClientProfileProps {
  clientName: string;
  logoUrl?: string;
  primaryContact: string;
  email: string;
  startDate: string;
  completionPercentage: number;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  clientName,
  logoUrl,
  primaryContact,
  email,
  startDate,
  completionPercentage,
}) => (
  <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 text-white mb-8">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        {logoUrl && (
          <img src={logoUrl} alt={clientName} className="w-16 h-16 rounded-lg object-cover" />
        )}
        <div>
          <h2 className="text-2xl font-bold">{clientName}</h2>
          <p className="text-slate-300">Onboarding started {startDate}</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Primary Contact</p>
        <p className="font-medium">{primaryContact}</p>
        <p className="text-sm text-slate-300">{email}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Overall Progress</p>
        <p className="text-3xl font-bold">{Math.round(completionPercentage)}%</p>
      </div>
    </div>

    {/* Progress bar */}
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300"
        style={{ width: `${completionPercentage}%` }}
      />
    </div>
  </div>
);
