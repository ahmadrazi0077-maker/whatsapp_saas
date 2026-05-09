import React from 'react';
import { MessageCircle, Mail, MapPin, Phone, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="h-8 w-8 text-whatsapp-green" />
              <span className="text-xl font-bold text-white">WhatsFlow</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Professional WhatsApp automation platform. Send bulk messages, manage contacts, 
              and automate your business communications.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://twitter.com/whatsflow" target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="https://linkedin.com/company/whatsflow" target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="https://github.com/whatsflow" target="_blank" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
              <li><Link href="/upgrade" className="text-gray-400 hover:text-white transition-colors">Upgrade Plan</Link></li>
              <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
              <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/partners" className="text-gray-400 hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</Link></li>
              <li><Link href="/sla" className="text-gray-400 hover:text-white transition-colors">SLA</Link></li>
            </ul>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="grid md:grid-cols-3 gap-6 py-8 border-t border-gray-800">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-whatsapp-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Email Support</p>
              <Link href="mailto:support@whatsflow.com" className="text-gray-400 text-xs mt-1 hover:text-white transition-colors block">support@whatsflow.com</Link>
              <p className="text-gray-500 text-xs">24/7 for Pro & Business plans</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-whatsapp-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Office</p>
              <p className="text-gray-400 text-xs mt-1">123 Tech Street, Silicon Valley</p>
              <p className="text-gray-500 text-xs">CA 94025, United States</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-whatsapp-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Phone</p>
              <Link href="tel:+15551234567" className="text-gray-400 text-xs mt-1 hover:text-white transition-colors block">+1 (555) 123-4567</Link>
              <p className="text-gray-500 text-xs">Mon-Fri 9am-6pm EST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WhatsFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
            <span className="text-gray-700">|</span>
            <span>Made with ❤️ for WhatsApp automation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}