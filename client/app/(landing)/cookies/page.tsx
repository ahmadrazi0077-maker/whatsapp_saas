import React from 'react';



export default function CookiesPage() {
  return (
    <>
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files stored on your device when you visit our website. 
                They help us remember your preferences, understand how you use our service, and 
                improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Essential Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                Required for the website to function properly. These cannot be disabled.
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                <li>Authentication tokens (JWT)</li>
                <li>Session management</li>
                <li>Security features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Functional Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                Help us remember your preferences and settings.
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                <li>Dark mode preference</li>
                <li>Language settings</li>
                <li>Notification preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Analytics Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                Help us understand how you use our service to improve it.
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
                <li>Page visits and navigation</li>
                <li>Feature usage statistics</li>
                <li>Performance monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-gray-600 space-y-2">
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Clear cookies when you close the browser</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3">
                Note that blocking essential cookies may prevent you from using certain features of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Questions about our Cookie Policy? Contact us at:
                <br />
                Email: privacy@whatsflow.com
              </p>
            </section>
          </div>
        </div>
      </div>
      
    </>
  );
}

