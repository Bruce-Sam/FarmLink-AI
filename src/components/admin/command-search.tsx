'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Map,
  Settings,
  ShoppingBasket,
  Sparkles,
  Tractor,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ADMIN_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  keywords: string;
  href: string;
  group: string;
  icon: LucideIcon;
}

interface CommandSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandSearch({ open: controlledOpen, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const items: CommandItem[] = useMemo(
    () => [
      { id: 'home', label: 'Command Centre', keywords: 'dashboard overview home', href: ADMIN_ROUTES.home, group: 'Navigation', icon: LayoutDashboard },
      { id: 'farmers', label: 'Farmers', keywords: 'users producers', href: ADMIN_ROUTES.farmers, group: 'People', icon: Tractor },
      { id: 'buyers', label: 'Buyers', keywords: 'business procurement', href: ADMIN_ROUTES.buyers, group: 'People', icon: Users },
      { id: 'listings', label: 'Listings', keywords: 'produce marketplace', href: ADMIN_ROUTES.listings, group: 'Marketplace', icon: Warehouse },
      { id: 'demands', label: 'Demands', keywords: 'buyer requirements', href: ADMIN_ROUTES.demands, group: 'Marketplace', icon: ClipboardList },
      { id: 'matches', label: 'Matches', keywords: 'recommendations ai', href: ADMIN_ROUTES.matches, group: 'Marketplace', icon: Sparkles },
      { id: 'offers', label: 'Offers', keywords: 'negotiation pending', href: ADMIN_ROUTES.offers, group: 'Marketplace', icon: Handshake },
      { id: 'transactions', label: 'Transactions', keywords: 'deals completed', href: ADMIN_ROUTES.transactions, group: 'Operations', icon: ShoppingBasket },
      { id: 'transport', label: 'Transport suggestions', keywords: 'logistics routing', href: ADMIN_ROUTES.transportSuggestions, group: 'Operations', icon: Truck },
      { id: 'analytics', label: 'Analytics', keywords: 'charts reports', href: ADMIN_ROUTES.analytics, group: 'Intelligence', icon: BarChart3 },
      { id: 'regional', label: 'Regional activity', keywords: 'map regions ashanti', href: ADMIN_ROUTES.regionalActivity, group: 'Intelligence', icon: Map },
      { id: 'notifications', label: 'Notifications', keywords: 'alerts', href: ADMIN_ROUTES.notifications, group: 'System', icon: Bell },
      { id: 'audit', label: 'Audit logs', keywords: 'history actions', href: ADMIN_ROUTES.auditLogs, group: 'System', icon: FileText },
      { id: 'settings', label: 'Settings', keywords: 'preferences config', href: ADMIN_ROUTES.settings, group: 'System', icon: Settings },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.keywords.toLowerCase().includes(term),
    );
  }, [items, query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router, setOpen],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].href);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, activeIndex, navigate]);

  const groups = [...new Set(filtered.map((i) => i.group))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-left">Quick navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Search admin pages and jump with arrow keys
          </DialogDescription>
          <Input
            autoFocus
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2"
          />
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>
          ) : (
            groups.map((group) => (
              <div key={group} className="mb-2">
                <p className="admin-label px-2 py-1">{group}</p>
                {filtered
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const globalIndex = filtered.indexOf(item);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                          globalIndex === activeIndex
                            ? 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]'
                            : 'hover:bg-muted',
                        )}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        onClick={() => navigate(item.href)}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {item.label}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
