'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/blog`);
      const data = await res.json();
      if (data.success) setPosts((data.data || []).slice(0, 3));
    } catch (err) {
      // Fallback sample data
      setPosts([
        { id: '1', title: 'Getting Started with WhatsApp Automation', slug: 'getting-started', excerpt: 'Learn how to set up your first WhatsApp automation campaign.', category: 'Guide', author: 'WhatsFlow Team', createdAt: '2026-05-01', tags: ['whatsapp', 'guide'] },
        { id: '2', title: '10 WhatsApp Marketing Tips for 2026', slug: 'marketing-tips', excerpt: 'Discover top WhatsApp marketing strategies.', category: 'Marketing', author: 'Sarah Johnson', createdAt: '2026-04-28', tags: ['marketing', 'tips'] },
        { id: '3', title: 'Chatbot Rules Guide', slug: 'chatbot-guide', excerpt: 'Master auto-reply rules for your business.', category: 'Guide', author: 'Mike Wilson', createdAt: '2026-04-25', tags: ['chatbot', 'guide'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">From Our Blog</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and best practices for WhatsApp automation
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-whatsapp-green animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-whatsapp-green/10 text-whatsapp-green rounded-full font-medium">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-whatsapp-green transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="h-3 w-3" /> {post.author}
                    </span>
                    <span className="text-whatsapp-green text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-whatsapp-green font-semibold hover:underline"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}