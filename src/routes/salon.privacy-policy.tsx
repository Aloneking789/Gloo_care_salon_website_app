import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/salon/privacy-policy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div>
      <PageHeader title="Privacy Policy" />
      <Card>
        <CardContent className="space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            GlooCare respects your privacy. This policy explains what information we collect from
            salon partners and how we use it.
          </p>
          <h2 className="text-base font-semibold text-foreground">Information we collect</h2>
          <p>
            Salon name, owner details, contact information, address, gallery images, services,
            staff information, and booking activity needed to operate the platform.
          </p>
          <h2 className="text-base font-semibold text-foreground">How we use it</h2>
          <p>
            To match customers to your salon, process bookings, calculate commissions, and provide
            support. We do not sell your data to third parties.
          </p>
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p>For privacy questions, email privacy@gloocare.com.</p>
        </CardContent>
      </Card>
    </div>
  );
}
