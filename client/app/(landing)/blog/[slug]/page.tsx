import React from 'react';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL}'}/blog/${slug}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-whatsapp-green hover:underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="px-2 py-1 bg-whatsapp-green/10 text-whatsapp-green rounded-full text-xs font-medium">
            {post.category}
          </span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8" />
        )}

        <div className="prose max-w-none text-gray-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
      </div>
    </div>
  );
}