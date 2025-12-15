'use client';
import React, { useState } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Link, 
  Heading1, Heading2, Quote, Code, Image,
  Eye, Save, ArrowLeft, Undo, Redo, Type, AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import remarkGfm

export default function StandaloneArticleEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(content);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, history, historyIndex]);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText, newCursorPos;

    if (selectedText) {
      newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      newText = text.substring(0, start) + before + placeholder + after + text.substring(end);
      newCursorPos = start + before.length;
    }

    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + placeholder.length);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    let lineStart = text.lastIndexOf('\n', start - 1) + 1;
    
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Judul artikel wajib diisi!');
      return;
    }
    console.log('Saving:', { title, content });
    alert('Artikel berhasil disimpan!');
  };

  const tools = [
    { icon: Undo, label: 'Undo', action: undo, disabled: historyIndex === 0 },
    { icon: Redo, label: 'Redo', action: redo, disabled: historyIndex === history.length - 1 },
    { type: 'divider' },
    { icon: Heading1, label: 'Heading 1', action: () => insertLine('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertLine('## ') },
    { icon: Type, label: 'Heading 3', action: () => insertLine('### ') },
    { type: 'divider' },
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'teks tebal') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'teks miring') },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: () => insertLine('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertLine('1. ') },
    { type: 'divider' },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)', 'teks link') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![', '](url)', 'alt text') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: Quote, label: 'Quote', action: () => insertLine('> ') },
  ];

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\*\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/!\*\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-4" />')
      .replace(/\n/g, '<br />');
    
    return html;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-black">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-black">Editor Artikel</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showPreview ? 'bg-amber-600 text-white' : 'border text-gray-700 hover:bg-gray-50'}`}
            >
              <Eye size={18} />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold shadow-md"
            >
              <Save size={18} />
              Simpan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Artikel Anda..."
            className="w-full text-4xl font-bold text-black outline-none bg-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {!showPreview ? (
            <div className="bg-white rounded-xl border m-6 overflow-hidden shadow-sm">
              <div className="border-b p-3 flex items-center gap-1 flex-wrap bg-gray-50">
                {tools.map((tool, index) => 
                  tool.type === 'divider' ? (
                    <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
                  ) : (
                    <button
                      key={index}
                      onClick={tool.action}
                      disabled={tool.disabled}
                      title={tool.label}
                      className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <tool.icon size={18} />
                    </button>
                  )
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis artikel Anda di sini..."
                className="w-full min-h-[600px] p-8 text-black text-lg leading-relaxed outline-none resize-none"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border m-6 p-8 shadow-sm">
              <h1 className="text-4xl font-bold text-black mb-8">
                {title || 'Judul Artikel'}
              </h1>
              <div 
                className="prose prose-lg max-w-none text-black leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '*Belum ada konten*') }}
              />
            </div>
          )}

          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Tips Markdown:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                <li># Heading 1, ## Heading 2, ### Heading 3</li>
                <li>**bold**, *italic*, `code`</li>
                <li>- List item, 1. Numbered</li>
                <li>[text](url), ![alt](img-url)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t py-3">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center text-sm text-gray-500">
          <div>Markdown Editor</div>
          <div className="font-medium">
            {content.length} karakter • {content.split(/\s+/).filter(w => w).length} kata
          </div>
        </div>
      </div>
    </div>
  );
}
