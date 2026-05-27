import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, HelpCircle, Shield, User as UserIcon } from 'lucide-react';

export const Route = createFileRoute('/salon/settings')({
  component: SettingsPage,
});

const items = [
  { to: '/salon/profile', label: 'Profile & contact details', icon: UserIcon },
  { to: '/salon/help-support', label: 'Help & support', icon: HelpCircle },
  { to: '/salon/privacy-policy', label: 'Privacy policy', icon: Shield },
] as const;

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.to}>
                  <Link to={it.to} className="flex items-center justify-between p-4 hover:bg-secondary">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{it.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
