import React from 'react';



export default function PrivacyPage() {
  return (
    <>
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                When you use WhatsFlow, we collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-600 space-y-2">
                <li>Account information (name, email address, phone number)</li>
                <li>WhatsApp device information for message automation</li>
                <li>Contact lists and message templates you create</li>
                <li>Usage data and analytics about how you use our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our WhatsApp automation services</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage & Security</h2>
              <p className="text-gray-600 leading-relaxed">
                Your data is stored securely on servers provided by Supabase (PostgreSQL database) and 
                Upstash (Redis caching). We implement industry-standard security measures including 
                encryption at rest and in transit, regular security audits, and access controls.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                WhatsApp messages are processed through official WhatsApp APIs and are subject to 
                WhatsApp's own privacy policies and terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties. 
                We may share aggregated, anonymized data for analytical purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about this Privacy Policy, contact us at:
                <br />
                Email: privacy@whatsflow.com
                <br />
                Address: WhatsFlow Inc., 123 Business Street, Tech City, TC 12345
              </p>
            </section>
          </div>
        </div>
      </div>
      
    </>
  );
}
