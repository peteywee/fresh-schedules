'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  GanttChartSquare,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Bell,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/schedule',
    label: 'Schedule',
    icon: CalendarDays,
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: FileText,
  },
  {
    href: '/labor',
    label: 'Labor Plan',
    icon: GanttChartSquare,
  },
  {
    href: '/forecast',
    label: 'Forecast AI',
    icon: BarChart3,
  },
  {
    href: '/alerts',
    label: 'Alerts',
    icon: Bell,
  },
];

const settingsMenuItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
};

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Button variant="ghost" className="h-10 w-full justify-start px-2 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center">
            <Logo className="size-6 shrink-0" />
            <span className="font-headline text-lg ml-2 group-data-[collapsible=icon]:hidden">ShiftWise</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === settingsMenuItem.href}
              tooltip={settingsMenuItem.label}
            >
              <Link href={settingsMenuItem.href}>
                <settingsMenuItem.icon />
                <span>{settingsMenuItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}