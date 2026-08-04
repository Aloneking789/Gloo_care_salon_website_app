import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  BookOpen,
  Video,
  FileText,
  AlertTriangle,
  Star,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const Route = createFileRoute('/salon/help-support')({
  component: HelpPage,
});

interface FAQItem {
  question: string;
  answer: string;
}

function HelpPage() {
  const faqs: FAQItem[] = [
    {
      question: 'How do I update my salon location?',
      answer: 'Go to Profile > Location & Address, fill in your address details, and click "Get Current Location" to fetch GPS coordinates. Then click "Update Profile" to save.',
    },
    {
      question: 'How do I add new services?',
      answer: 'Navigate to the Services tab, tap the "+" button, fill in service details including name, duration, price, and category, then save.',
    },
    {
      question: 'Can I manage multiple booking modes?',
      answer: 'Yes! In Settings, you can choose between Slot Booking, Queue System, or Hybrid Mode. Hybrid mode allows you to set different modes for different times of the day.',
    },
    {
      question: 'How do I add staff members?',
      answer: 'Go to the Staff tab, tap "Add Barber", enter their details including name, specialties, experience, and upload a photo.',
    },
    {
      question: 'What is commission percentage?',
      answer: 'Commission percentage is the platform fee deducted from your earnings. You can see the breakdown in your dashboard under Revenue Overview.',
    },
    {
      question: 'How do I track my earnings?',
      answer: 'The Dashboard shows your earnings breakdown by Today, Weekly, Monthly, and All Time. Each section displays total amount, commission, and in-hand earnings.',
    },
    {
      question: 'Can I export my booking data?',
      answer: 'Currently, you can view all bookings in the Bookings tab. Data export feature is coming soon!',
    },
    {
      question: 'How do I handle walk-in customers?',
      answer: 'If you\'re using Queue Mode or Hybrid Mode, walk-in customers will automatically get queue numbers. You can manage them from the Bookings tab.',
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'gloocare1@gmail.com',
      href: 'mailto:gloocare1@gmail.com',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      subtitle: '+91 7905518396',
      href: 'tel:+917905518396',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Support',
      subtitle: 'Chat with us',
      href: 'https://wa.me/917905518396',
    },
    {
      icon: HelpCircle,
      title: 'Live Chat Support',
      subtitle: 'Mon-Sat, 9AM-6PM',
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Open live chat');
      },
    },
  ];

  const quickLinks = [
    {
      icon: BookOpen,
      title: 'User Guide',
      subtitle: 'Learn how to use the app',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      subtitle: 'Watch step-by-step guides',
    },
    {
      icon: FileText,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms of service',
    },
    {
      icon: AlertTriangle,
      title: 'Report an Issue',
      subtitle: 'Let us know about problems',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Help & Support" 
        description="Find answers to common questions or reach out to our support team."
      />

      {/* Main Body Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* FAQs Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Frequently Asked Questions</CardTitle>
              <CardDescription>Quick solutions to help you run your salon smoothly</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-b py-1">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Quick Links Card */}
          {/* <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-4 pt-0">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{link.subtitle}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </CardContent>
          </Card> */}

          {/* Support Hours Card */}
          <Card className="border bg-muted/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/15 p-2 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Support Hours</h4>
                  <p className="text-xs text-muted-foreground">Standard operational hours</p>
                </div>
              </div>
              <div className="space-y-2 border-t pt-3 text-sm text-muted-foreground">
                <div className="flex justify-between font-medium">
                  <span>Monday - Saturday:</span>
                  <span className="text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Sunday:</span>
                  <span className="text-destructive">Closed</span>
                </div>
                <p className="text-xs text-primary font-semibold text-center pt-2 italic">
                  We typically respond within 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section at the Bottom */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="text-xl font-bold">Contact Us</h3>
          <p className="text-sm text-muted-foreground mt-1">Get in touch with support assistants directly for any queries</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactOptions.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <Card key={idx} className="border hover:shadow-md transition-all duration-300">
                <a 
                  href={opt.href} 
                  onClick={opt.onClick}
                  className="block h-full p-5 hover:no-underline group text-center space-y-4"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 select-all font-medium">
                      {opt.subtitle}
                    </p>
                  </div>
                </a>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feedback Card */}
      <Card className="border bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="rounded-full bg-amber-100 p-3 text-amber-500 animate-bounce">
              <Star className="h-7 w-7 fill-amber-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Enjoying our app?</h4>
              <p className="text-sm text-muted-foreground mt-1">Rate us on the store and help us make GlooCare even better!</p>
            </div>
          </div>
          <Button asChild className="shrink-0 group cursor-pointer font-bold px-6 py-5">
            <a 
              href="https://play.google.com/store/apps/details?id=com.salonpartnerapp&hl=en_IN" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              Rate Us
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
