'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Employee, Shift } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { add, format, startOfWeek } from 'date-fns';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
const daysOfWeek = Array.from({ length: 7 }).map((_, i) => add(weekStart, { days: i }));

const employeeColors = [
  '#F44336', // Red
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#9C27B0', // Purple
];

const employees: Employee[] = [
  { id: '1', name: 'Ava Smith', role: 'Cashier', avatar: PlaceHolderImages[0], color: employeeColors[0] },
  { id: '2', name: 'Jackson Lee', role: 'Barista', avatar: PlaceHolderImages[1], color: employeeColors[1] },
  { id: '3', name: 'Isabella Nguyen', role: 'Shift Lead', avatar: PlaceHolderImages[2], color: employeeColors[2] },
  { id: '4', name: 'William Kim', role: 'Cook', avatar: PlaceHolderImages[3], color: employeeColors[3] },
];

const shifts: Shift[] = [
  { id: 's1', employeeId: '1', role: 'Cashier', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[0].getDate(), 9), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[0].getDate(), 17) },
  { id: 's2', employeeId: '2', role: 'Barista', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[0].getDate(), 9), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[0].getDate(), 15) },
  { id: 's3', employeeId: '3', role: 'Shift Lead', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[1].getDate(), 12), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[1].getDate(), 20) },
  { id: 's4', employeeId: '4', role: 'Cook', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[2].getDate(), 8), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[2].getDate(), 16) },
  { id: 's5', employeeId: '1', role: 'Cashier', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[3].getDate(), 13), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[3].getDate(), 21) },
  { id: 's6', employeeId: '2', role: 'Barista', startTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[4].getDate(), 7), endTime: new Date(today.getFullYear(), today.getMonth(), daysOfWeek[4].getDate(), 15) },
];

const ShiftCard = ({ shift, color }: { shift: Shift; color: string }) => (
  <div
    style={{ backgroundColor: color, borderColor: color }}
    className="p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity"
  >
    <p className="font-semibold text-xs text-white">{shift.role}</p>
    <p className="text-xs text-white/90">
      {format(shift.startTime, 'h:mma')} - {format(shift.endTime, 'h:mma')}
    </p>
  </div>
);

export function ScheduleCalendar() {
  const employeeMap = new Map(employees.map(e => [e.id, e]));

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Employee</TableHead>
            {daysOfWeek.map(day => (
              <TableHead key={day.toString()} className="text-center">
                <div>{format(day, 'EEE')}</div>
                <div className="font-normal text-muted-foreground">{format(day, 'd')}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(employee => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={employee.avatar.imageUrl} data-ai-hint={employee.avatar.imageHint} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
              </TableCell>
              {daysOfWeek.map(day => {
                const employeeShiftsForDay = shifts.filter(
                  shift => shift.employeeId === employee.id && 
                           format(shift.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                );
                return (
                  <TableCell key={day.toString()} className="align-top p-2">
                    <div className="space-y-2">
                      {employeeShiftsForDay.map(shift => {
                        const shiftEmployee = employeeMap.get(shift.employeeId);
                        return (
                          <ShiftCard key={shift.id} shift={shift} color={shiftEmployee?.color || 'hsl(var(--primary))'} />
                        );
                      })}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
