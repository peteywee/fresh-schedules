import React from 'react';

// Minimal facade to satisfy imports; flesh out as needed
export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);
export const Modal = ({ open, children }: { open: boolean; children: React.ReactNode }) =>
  open ? <div>{children}</div> : null;