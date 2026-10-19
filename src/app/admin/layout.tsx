import React from 'react';
import AdminShell from '@/components/AdminShell';

// Opt out of instant-navigation validation on the admin dynamic tree if necessary
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
