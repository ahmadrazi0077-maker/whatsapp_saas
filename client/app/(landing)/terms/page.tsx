import React from 'react';



export default function TermsPage() {
  return (
    <>
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using WhatsFlow ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                WhatsFlow provides WhatsApp automation tools including bulk messaging, contact management, 
                device management, campaign scheduling, and chatbot automation. The Service is provided on 
                a subscription basis with different plan tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. 
                You must provide accurate and complete information when creating your account. 
                You may not share your account with others or use another user's account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription & Payments</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Free Plan: Limited features at no cost</li>
                <li>Paid Plans: Billed monthly or annually via Stripe</li>
                <li>All payments are non-refundable unless required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree not to use the Service for:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-600 space-y-2">
                <li>Spam or unsolicited messaging</li>
                <li>Harassment, threats, or abusive content</li>
                <li>Fraudulent or deceptive activities</li>
                <li>Violating WhatsApp's Terms of Service</li>
                <li>Any illegal activities under applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                WhatsFlow is provided "as is" without warranties of any kind. We are not liable for 
                any damages arising from the use of our Service, including but not limited to loss of 
                data, business interruption, or third-party claims.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation 
                of these terms. You may terminate your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms, contact us at:
                <br />
                Email: legal@whatsflow.com
              </p>
            </section>
          </div>
        </div>
      </div>
      
    </>
  );
}
