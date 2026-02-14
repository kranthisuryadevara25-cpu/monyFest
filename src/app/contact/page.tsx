import { StaticPageLayout } from '@/components/legal/static-page-layout';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us — MonyFest',
  description: 'Get in touch with MonyFest for support, partnerships, or general enquiries.',
};

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="Contact Us"
      description="We'd love to hear from you. Reach out for support, partnerships, or general enquiries."
    >
      <div className="space-y-6 text-white/80">
        <p>
          For questions about your account, loyalty points, rewards, or the platform, please use the channels below.
        </p>

        <div className="grid gap-4 sm:grid-cols-1">
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Email</h3>
              <a href="mailto:support@monyfest.club" className="text-cyan-300 hover:underline">
                support@monyfest.club
              </a>
              <p className="text-sm text-white/60 mt-1">General support and enquiries</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <MessageCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Partnerships & Business</h3>
              <a href="mailto:partners@monyfest.club" className="text-cyan-300 hover:underline">
                partners@monyfest.club
              </a>
              <p className="text-sm text-white/60 mt-1">Merchant onboarding, agents, and B2B</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <MapPin className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">Registered address</h3>
              <p className="text-white/80">
                MonyFest<br />
                [Your registered business address]<br />
                India
              </p>
              <p className="text-sm text-white/60 mt-1">Update this with your actual address in production.</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60">
          We aim to respond to all enquiries within 1–2 business days. For urgent account or payment issues, please mention &quot;Urgent&quot; in your subject line.
        </p>
      </div>
    </StaticPageLayout>
  );
}
