'use client';

import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import type { IconType } from 'react-icons';

type Variant = 'error' | 'success' | 'warning' | 'info';

const styles: Record<Variant, { wrap: string; icon: string; Icon: IconType }> = {
  error: { wrap: 'bg-red-50 border-red-200 text-red-700', icon: 'text-red-500', Icon: FiAlertCircle },
  success: { wrap: 'bg-green-50 border-green-200 text-green-700', icon: 'text-green-500', Icon: FiCheckCircle },
  warning: { wrap: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: 'text-yellow-500', Icon: FiAlertTriangle },
  info: { wrap: 'bg-blue-50 border-blue-200 text-blue-700', icon: 'text-blue-500', Icon: FiInfo },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: {
  variant?: Variant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const s = styles[variant];
  const Icon = s.Icon;
  return (
    <div role="alert" className={`flex items-start gap-3 p-4 border rounded-lg ${s.wrap} ${className}`.trim()}>
      <Icon className={`${s.icon} mt-0.5 flex-shrink-0`} size={18} aria-hidden="true" />
      <div className="text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children}
      </div>
    </div>
  );
}
