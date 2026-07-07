import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for whatapp-auto.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our WhatsApp CRM services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Account information (name, email, phone number)</li>
            <li>WhatsApp Business API credentials</li>
            <li>Contact and conversation data</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Process and manage WhatsApp conversations</li>
            <li>Improve our platform and user experience</li>
            <li>Communicate with you about updates and support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Sharing and Disclosure</h2>
          <p>We do not sell or rent your personal information. We may share data with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Meta Platforms, Inc. (WhatsApp Business API)</li>
            <li>Service providers and hosting partners</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your data, including encryption, access controls, and secure hosting infrastructure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at privacy@whatapp-auto.com to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@whatapp-auto.com.</p>
        </section>
      </div>
    </div>
  );
}
