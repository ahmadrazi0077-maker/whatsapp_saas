import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            WhatsApp SaaS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Powerful WhatsApp automation for businesses
          </p>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
