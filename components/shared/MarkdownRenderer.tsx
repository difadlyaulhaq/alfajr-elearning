import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Globally imported in app/layout.tsx

// Custom Components for ReactMarkdown
const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 mt-8 border-b-4 border-blue-500 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-bold text-gray-800 mb-5 mt-7 border-b-2 border-blue-400 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-semibold text-gray-700 mb-3 mt-5">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="text-base text-gray-700 mb-4 leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-gray-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-gray-800">{children}</em>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-4 ml-4 space-y-2 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-4 ml-4 space-y-2 text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-gray-700 leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 mb-4 italic text-gray-700">
      {children}
    </blockquote>
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
       <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono">
        <code className={className} {...props}>
            {children}
        </code>
       </div>
    ) : (
      <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }: any) => (
    <>{children}</>
  ),
a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline font-medium"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: any) => (
    <img
      src={src}
      alt={alt || 'Image'}
      className="max-w-full h-auto rounded-lg shadow-md my-4"
      onError={(e) => {
        e.currentTarget.style.display = 'none'; // Hide broken images
      }}
    />
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-300" />
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gray-100">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="border-b border-gray-300">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-800 border border-gray-300">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-gray-700 border border-gray-300">
      {children}
    </td>
  ),
};

// Reusable Markdown Renderer Component
export const MarkdownRenderer: React.FC<{ content: string, components?:any, className?: string }> = ({ content, components, className }) => {
  return (
    <div className={className || "markdown-content prose prose-lg max-w-none"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{...MarkdownComponents, ...components}}
      >
        {content || '*Tidak ada konten untuk ditampilkan*'}
      </ReactMarkdown>
    </div>
  );
};