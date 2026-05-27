import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

export const Route = createFileRoute('/salon/help-support')({
  component: HelpPage,
});

function HelpPage() {
  return (
    <div>
      <PageHeader title="Help & Support" description="We're here to help" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary p-3 text-primary"><Mail className="h-5 w-5" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <a href="mailto:support@gloocare.com" className="font-medium hover:underline">support@gloocare.com</a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary p-3 text-primary"><Phone className="h-5 w-5" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <a href="tel:+911234567890" className="font-medium hover:underline">+91 12345 67890</a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="prose prose-sm max-w-none p-6 text-sm text-muted-foreground">
          <p>
            Our partner support team is available Monday to Saturday, 9 AM to 7 PM IST.
            For urgent issues, please call. For non-urgent queries, email is the fastest way.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
