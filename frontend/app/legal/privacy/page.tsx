export const metadata = { title: 'Privacy Policy | VenuePlus' };
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose">
      <h1>Privacy Policy</h1>
      <p><em>Template — see <code>/legal/privacy-policy.md</code> in the repo for the full text.</em></p>
      <p>VenuePlus collects account info, listing data, booking history, payment metadata (via Stripe), and basic usage data to operate the marketplace. We never sell your data. The full policy lives in the project repository under <code>legal/privacy-policy.md</code>.</p>
    </div>
  );
}
