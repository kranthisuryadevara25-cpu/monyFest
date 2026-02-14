import { StaticPageLayout } from '@/components/legal/static-page-layout';

export const metadata = {
  title: 'Refunds Policy — MonyFest',
  description: 'Policy for refunds on the MonyFest platform.',
};

export default function RefundsPage() {
  return (
    <StaticPageLayout
      title="Refunds Policy"
      description="How refunds work for purchases, rewards, and platform fees."
    >
      <div className="space-y-6 text-white/80">
        <p>
          At MonyFest, we aim to handle refunds fairly and in line with applicable law. This policy explains when and how refunds may apply.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Purchases at merchants</h2>
        <p>
          Refunds for goods or services you buy from a merchant (in-store or via the platform) are governed by that merchant&apos;s refund policy and applicable consumer law. If you have a dispute about a purchase, please contact the merchant first. MonyFest may assist in facilitating communication but is not responsible for the merchant&apos;s refund decisions.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Loyalty points and rewards</h2>
        <p>
          Loyalty points are generally non-refundable once earned or used. If you redeem points for a coupon or reward and the underlying offer is cancelled or not honoured by the merchant, you may contact support; we will endeavour to reinstate points or provide an alternative where the failure is due to our or the merchant&apos;s error.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Commission and Boost payouts</h2>
        <p>
          Commission payouts (for agents) and Boost withdrawal requests (for merchants) are processed according to our internal approval and payout schedules. Rejected or reversed payouts may be refunded to the platform balance (e.g. Boost balance) or adjusted in your account. Disputes should be raised via the dashboard or support within 30 days of the relevant transaction.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Platform or subscription fees</h2>
        <p>
          If we charge any platform or subscription fee and you are entitled to a refund under law or our stated policy, we will process the refund via the original payment method within a reasonable period, typically 7–14 business days.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. How to request a refund</h2>
        <p>
          For purchase-related refunds: contact the merchant or use the order/transaction details in your account. For points/rewards or payout issues: use the &quot;Contact Us&quot; form or email support@monyfest.club with your user ID and transaction reference.
        </p>

        <p className="mt-8 text-sm text-white/60">
          Last updated: {new Date().toLocaleDateString('en-IN')}. For further help, see <a href="/contact" className="text-cyan-300 hover:underline">Contact Us</a>.
        </p>
      </div>
    </StaticPageLayout>
  );
}
