import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Mail, Phone } from 'lucide-react';

export const Route = createFileRoute('/salon/privacy-policy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader 
        title="Privacy Policy" 
        description="Last Updated: January 12, 2026"
      />

      <Card className="border shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-foreground">GlooCare Privacy Terms</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Please read our privacy commitments carefully</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-foreground">1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us when you register for an account, 
              update your profile, or use our services. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-muted-foreground">
              <li>Business information (salon name, owner name)</li>
              <li>Contact information (email, phone number)</li>
              <li>Location data (salon address and GPS coordinates)</li>
              <li>Service and booking information</li>
              <li>Staff and barber details</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-muted-foreground">
              <li>Provide and maintain our services</li>
              <li>Process bookings and manage appointments</li>
              <li>Send you notifications and updates</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about your account</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">3. Location Data</h3>
            <p>
              We collect your salon's location data to help customers find your business. 
              Location information is used to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-muted-foreground">
              <li>Display your salon on the map</li>
              <li>Help customers navigate to your location</li>
              <li>Provide location-based services</li>
            </ul>
            <p>
              You can update or remove your location information at any time through your profile settings.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">4. Information Sharing</h3>
            <p>
              We do not sell or rent your personal information to third parties. We may share your 
              information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-muted-foreground">
              <li>With customers who book appointments at your salon</li>
              <li>With service partners who help us operate our platform</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">5. Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">6. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">7. Data Retention</h3>
            <p>
              We retain your information for as long as your account is active or as needed to provide 
              services. If you wish to delete your account, please contact our support team.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">8. Children's Privacy</h3>
            <p>
              Our services are not intended for users under the age of 18. We do not knowingly collect 
              information from children under 18.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">9. Changes to Privacy Policy</h3>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4 border-t pt-6">
            <h3 className="text-base font-bold text-foreground">10. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:gloocare1@gmail.com" className="font-semibold text-foreground hover:text-primary hover:underline truncate">
                  gloocare1@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+917905518396" className="font-semibold text-foreground hover:text-primary hover:underline">
                  +91 7905518396
                </a>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Footer Banner */}
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-center">
        <p className="text-xs font-semibold text-primary leading-normal">
          By using our services, you agree to this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
