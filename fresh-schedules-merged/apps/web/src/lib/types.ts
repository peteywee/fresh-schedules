import type { ImagePlaceholder } from './placeholder-images';

export type User = {
  name: string;
  email: string;
  avatar: ImagePlaceholder;
  role: 'Owner' | 'Manager' | 'Staff';
};

export type Shift = {
  id: string;
  employeeId: string;
  role: string;
  startTime: Date;
  endTime: Date;
};

export type Activity = {
  id: string;
  user: {
    name: string;
    avatar: ImagePlaceholder;
  };
  action: string;
  target: string;
  timestamp: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  avatar: ImagePlaceholder;
  color: string;
};
