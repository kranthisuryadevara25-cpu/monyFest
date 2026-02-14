import { StaticPageLayout } from '@/components/legal/static-page-layout';

export const metadata = {
  title: 'Privacy Policy — MonyFest',
  description: 'How MonyFest collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      description="Your privacy matters. This policy explains how we handle your data."
    >
      <div className="space-y-6 text-white/80">
        <p>
          MonyFest (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy describes what information we collect, how we use it, and your choices when you use our platform, website, and services.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Information we collect</h2>
        <p>We may collect:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><strong className="text-white">Account and profile data:</strong> name, email, phone, role (member/merchant/agent), and any details you provide during registration or in your profile.</li>
          <li><strong className="text-white">Transaction and usage data:</strong> purchases, loyalty points, redemptions, referral activity, and how you use the platform.</li>
          <li><strong className="text-white">Device and technical data:</strong> IP address, browser type, device identifiers, and log data when you access our services.</li>
          <li><strong className="text-white">Communications:</strong> messages you send to support or through the platform.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">2. How we use your information</h2>
        <p>
          We use the information to provide and improve our services, process transactions, allocate loyalty points and rewards, manage referrals and commissions, communicate with you, enforce our terms, comply with law, and for analytics and security. We do not sell your personal information to third parties for marketing.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Sharing of information</h2>
        <p>
          We may share data with merchants (e.g. to attribute purchases and rewards), agents (e.g. referral and territory context), service providers who assist us (hosting, analytics, payment processing), and when required by law or to protect rights and safety. We require partners to use data only for the purposes we specify and in line with this policy.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Data retention</h2>
        <p>
          We retain your information for as long as your account is active and as needed to provide services, resolve disputes, comply with legal obligations, and enforce our agreements. You may request deletion of your account and associated data subject to applicable law.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Security</h2>
        <p>
          We use industry-standard measures to protect your data, including encryption and access controls. No method of transmission or storage is 100% secure; we encourage you to use a strong password and keep your login details private.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">6. Your rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, delete, or port your data, or to object to or restrict certain processing. You can update much of your profile from your account settings. For other requests, contact us at support@monyfest.club or via the Contact Us page.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Cookies and tracking</h2>
        <p>
          We use cookies and similar technologies for authentication, preferences, and analytics. You can control cookies through your browser settings. Disabling some cookies may affect how the platform works.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Children</h2>
        <p>
          Our services are not directed at individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected such data, please contact us so we can delete it.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the revised policy on the platform and, for material changes, we will notify you by email or a prominent notice. Continued use after the effective date constitutes acceptance.
        </p>

        <p className="mt-8 text-sm text-white/60">
          Last updated: {new Date().toLocaleDateString('en-IN')}. For questions or to exercise your rights, see <a href="/contact" className="text-cyan-300 hover:underline">Contact Us</a>.
        </p>
      </div>
    </StaticPageLayout>
  );
}
