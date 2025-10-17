'use client';

import { formatShiftTime } from '@/lib/utils/time';
import { cn } from '@/lib/utils/cn';

interface ShiftCardProps {
  shift: {
    shiftId: string;
    start: string;
    end: string;
    roleTag?: string;
    uid?: string;
  };
  assignedStaffName?: string;
  onClick?: () => void;
  className?: string;
}

const roleColors = {
  server: 'bg-blue-100 text-blue-800',
  cook: 'bg-orange-100 text-orange-800',
  cashier: 'bg-green-100 text-green-800',
  manager: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

export function ShiftCard({ shift, assignedStaffName, onClick, className }: ShiftCardProps) {
  const isOpen = !shift.uid;
  const roleColor = roleColors[shift.roleTag as keyof typeof roleColors] || roleColors.default;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md',
        isOpen ? 'border-dashed border-amber-400 bg-amber-50' : 'border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium">
          {formatShiftTime(shift.start, shift.end)}
        </div>
        {shift.roleTag && (
          <span className={cn('text-xs px-2 py-1 rounded-full', roleColor)}>
            {shift.roleTag}
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        {isOpen ? (
          <span className="text-amber-700 font-medium">Open Shift</span>
        ) : (
          assignedStaffName || 'Assigned'
        )}
      </div>
    </div>
  );
}
