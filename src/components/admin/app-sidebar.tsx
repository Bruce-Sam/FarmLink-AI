'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  ShoppingBasket,
  Sparkles,
  Tractor,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { AfuoPortalMark } from '@/components/brand/AfuoPortalMark';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StatusRail } from '@/components/admin/status-rail';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Command Centre',
    items: [{ href: ADMIN_ROUTES.home, label: 'Overview', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'People',
    items: [
      { href: ADMIN_ROUTES.farmers, label: 'Farmers', icon: Tractor },
      { href: ADMIN_ROUTES.buyers, label: 'Buyers', icon: Users },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { href: ADMIN_ROUTES.listings, label: 'Listings', icon: Warehouse },
      { href: ADMIN_ROUTES.demands, label: 'Demands', icon: ClipboardList },
      { href: ADMIN_ROUTES.matches, label: 'Matches', icon: Sparkles },
      { href: ADMIN_ROUTES.offers, label: 'Offers', icon: Handshake },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: ADMIN_ROUTES.transactions, label: 'Transactions', icon: ShoppingBasket },
      { href: ADMIN_ROUTES.transportSuggestions, label: 'Transport', icon: Truck },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { href: ADMIN_ROUTES.analytics, label: 'Analytics', icon: BarChart3 },
      { href: ADMIN_ROUTES.regionalActivity, label: 'Regional activity', icon: Map },
    ],
  },
  {
    title: 'System',
    items: [
      { href: ADMIN_ROUTES.notifications, label: 'Notifications', icon: Bell },
      { href: ADMIN_ROUTES.auditLogs, label: 'Audit logs', icon: FileText },
      { href: ADMIN_ROUTES.settings, label: 'Settings', icon: Settings },
    ],
  },
];

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--admin-nav-active)]/20 text-[var(--admin-nav-fg)] ring-1 ring-[var(--admin-nav-active)]/40'
          : 'text-[var(--admin-nav-muted)] hover:bg-[var(--admin-nav-hover)] hover:text-[var(--admin-nav-fg)]',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function SidebarNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto p-2">
      {navSections.map((section) => (
        <div key={section.title} className="mb-2">
          {!collapsed && (
            <p className="admin-label px-3 pb-1 pt-3 text-[var(--admin-nav-muted)]">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function AppSidebar({ mobileOpen, onMobileOpenChange }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarContent = (isMobile = false) => (
    <>
      <div className={cn('p-4', collapsed && !isMobile && 'px-2')}>
        <Link href={ADMIN_ROUTES.home} className="flex items-center gap-3">
          <AfuoPortalMark
            variant="admin"
            compact={collapsed && !isMobile}
            useFullLogo={!collapsed || isMobile}
            subtitle={collapsed && !isMobile ? undefined : 'Command centre'}
          />
        </Link>
      </div>
      <StatusRail />
      <Separator className="bg-white/10" />
      <SidebarNav
        pathname={pathname}
        collapsed={isMobile ? false : collapsed}
        onNavigate={isMobile ? () => onMobileOpenChange?.(false) : undefined}
      />
      {!isMobile && (
        <div className="border-t border-white/10 p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center text-[var(--admin-nav-muted)] hover:bg-[var(--admin-nav-hover)] hover:text-[var(--admin-nav-fg)]"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside
        className={cn(
          'admin-nav-panel hidden h-dvh shrink-0 flex-col border-r transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[5.25rem]' : 'w-[17rem]',
        )}
      >
        {sidebarContent()}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="fixed left-3 top-3 z-40 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="admin-nav-panel w-[17rem] border-r p-0 text-[var(--admin-nav-fg)]">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">{sidebarContent(true)}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
