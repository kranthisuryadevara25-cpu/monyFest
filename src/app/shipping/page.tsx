import { StaticPageLayout } from '@/components/legal/static-page-layout';

export const metadata = {
  title: 'Shipping Policy — MonyFest',
  description: 'Shipping and delivery policy for MonyFest and partner merchants.',
};

export default function ShippingPage() {
  return (
    <StaticPageLayout
      title="Shipping Policy"
      description="Information about shipping and delivery for orders and rewards."
    >
      <div className="space-y-6 text-white/80">
        <p>
          MonyFest is primarily a loyalty and rewards platform. Physical shipping, when it applies, may be handled by us or by partner merchants. This policy outlines how we approach shipping and delivery.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">1. Digital rewards and coupons</h2>
        <p>
          Many rewards on MonyFest are digital (e.g. coupons, points, cashback). These are delivered instantly to your account upon redemption or qualification. No physical shipping is involved for digital rewards.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Orders placed with merchants</h2>
        <p>
          When you place an order with a merchant through or in connection with MonyFest (e.g. in-store pickup, or an online order linked to your membership), shipping and delivery terms are set by that merchant. Delivery times, costs, and areas are as stated at checkout or on the merchant&apos;s page. MonyFest does not control inventory or logistics for third-party merchants.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Physical rewards shipped by MonyFest</h2>
        <p>
          If we ever ship physical rewards (e.g. merchandise or gift items) directly to you, we will use a reliable courier and ship to the address you provide. Delivery times are estimates and may vary by location. You are responsible for providing an accurate, deliverable address. Risk of loss passes to you upon delivery to the carrier unless otherwise required by law.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. International and restrictions</h2>
        <p>
          Our services and any physical shipping we offer are currently intended for India. We do not guarantee availability or delivery outside our stated service areas. Merchants may have their own international shipping policies.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. Delays and lost packages</h2>
        <p>
          For orders fulfilled by merchants, delays or lost packages should be reported to the merchant. For physical items shipped by MonyFest, please contact support@monyfest.club with your order or reward reference so we can assist with tracking or claims.
        </p>

        <p className="mt-8 text-sm text-white/60">
          Last updated: {new Date().toLocaleDateString('en-IN')}. Questions? See our <a href="/contact" className="text-cyan-300 hover:underline">Contact Us</a> page.
        </p>
      </div>
    </StaticPageLayout>
  );
}
