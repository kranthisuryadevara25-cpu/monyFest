import { StaticPageLayout } from '@/components/legal/static-page-layout';

export const metadata = {
  title: 'Terms & Conditions — MonyFest',
  description: 'Terms and conditions of use for the MonyFest loyalty and rewards platform.',
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      description="Please read these terms carefully before using MonyFest."
    >
      <div className="space-y-6 text-white/80">
        <p>
          These Terms and Conditions (&quot;Terms&quot;) govern your use of the MonyFest platform, including the website, mobile experience, and any services offered by MonyFest (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By accessing or using MonyFest, you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Eligibility</h2>
        <p>
          You must be at least 18 years old and capable of entering into a binding contract to use MonyFest. By registering as a member, merchant, or agent, you represent that you meet these requirements and that all information you provide is accurate and current.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Account and roles</h2>
        <p>
          MonyFest offers different roles (Member, Merchant, Agent). You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Merchants and agents may be subject to additional approval and terms. We reserve the right to suspend or terminate accounts that violate these Terms or our policies.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Loyalty points and rewards</h2>
        <p>
          Loyalty points, rewards, coupons, and other benefits are offered subject to the rules displayed at the time of earning or redemption. Points and rewards have no cash value unless explicitly stated. We and our merchant partners may modify or discontinue programs with reasonable notice where permitted by law.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Merchant and agent conduct</h2>
        <p>
          Merchants and agents must comply with all applicable laws and our merchant/agent guidelines. Fraudulent activity, misuse of the platform, or harm to other users may result in immediate termination and forfeiture of any pending rewards or payouts.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Intellectual property</h2>
        <p>
          The MonyFest name, logo, and all related content and technology are owned by us or our licensors. You may not copy, modify, or use our branding or systems for any purpose without our prior written consent.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">6. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, MonyFest and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim, or one hundred Indian Rupees, whichever is greater.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Changes to terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on the platform or by email. Continued use after such notice constitutes acceptance of the revised Terms.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of [insert jurisdiction].
        </p>

        <p className="mt-8 text-sm text-white/60">
          Last updated: {new Date().toLocaleDateString('en-IN')}. For questions, see our <a href="/contact" className="text-cyan-300 hover:underline">Contact Us</a> page.
        </p>
      </div>
    </StaticPageLayout>
  );
}
