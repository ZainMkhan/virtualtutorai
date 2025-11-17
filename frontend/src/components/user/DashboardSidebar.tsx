import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { avatarAPI } from '@/services/api';
import Logo from '../shared/Logo';
import UsageIndicator from './UsageIndicator';
import {
  Settings,
  Bot,
  MessageCircle,
  Home,
  ChevronsLeft,
  ChevronsRight,
  User,
  CreditCard,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

const DashboardSidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpen, state, toggleSidebar } = useSidebar();
  const { currentSubscription, usageData, refreshUsageData } = useAuth();
  const [avatarCount, setAvatarCount] = useState<number | null>(null);

  // Fetch avatar count on mount
  useEffect(() => {
    const fetchAvatarCount = async () => {
      try {
        const response = await avatarAPI.getAllAvatars(1, 1);
        if (response.success && response.data) {
          setAvatarCount(response.data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch avatar count:', error);
      }
    };
    fetchAvatarCount();
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
    // Close on mobile after navigation
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      badge: null,
    },
    {
      icon: Bot,
      label: 'Browse Avatars',
      path: '/avatars',
      badge: avatarCount?.toString() || null,
    },
    {
      icon: MessageCircle,
      label: 'Start new chat',
      path: '/conversation',
      badge: null,
    },
  ];



  const accountItems = [
    {
      icon: User,
      label: 'View Profile',
      path: '/profile',
      badge: null,
    },
    {
      icon: CreditCard,
      label: 'Subscription',
      path: '/subscription',
      badge: null,
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      badge: null,
    },
  ];

  // Filter items based on search
  const filteredMainItems = useMemo(() => {
    return mainNavItems;
  }, []);



  const filteredAccountItems = useMemo(() => {
    return accountItems;
  }, []);

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const IconComponent = item.icon;
    const active = isActive(item.path);
    return (
      <SidebarMenuButton
        onClick={() => handleNavigate(item.path)}
        className={`cursor-pointer transition-colors ${
          active
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-100'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
        isActive={active}
      >
        <IconComponent className="h-4 w-4" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.badge}
          </span>
        )}
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar className="border-r bg-white border-gray-200 h-full" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Logo - Always visible */}
          <div className="flex-shrink-0">
            <Logo size="sm" showText={false} textColor="text-gray-900" />
          </div>
          
          {/* Title - Only show when expanded */}
          {state === 'expanded' && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900">Virtual Tutor AI</h2>
            </div>
          )}
          
          {/* Desktop Minimize Button - Only show on desktop */}
          <button
            onClick={() => toggleSidebar()}
            className="hidden lg:flex h-8 w-8 items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
            title={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label="Toggle sidebar"
          >
            {state === 'expanded' ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-0">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {filteredMainItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                {renderNavItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">Account</SidebarGroupLabel>
          <SidebarMenu>
            {filteredAccountItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                {renderNavItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Usage Indicator */}
      <SidebarFooter className="mt-auto border-t border-gray-200 p-0">
        <UsageIndicator 
          usage={usageData || undefined}
          tierName={currentSubscription?.tierName}
          isCollapsed={state === 'collapsed'}
          onRefresh={refreshUsageData}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onNavigate }) => {
  return <DashboardSidebarContent onNavigate={onNavigate} />;
};

export default DashboardSidebar;
