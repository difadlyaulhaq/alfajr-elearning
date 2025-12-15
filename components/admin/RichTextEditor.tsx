'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, 
  Heading1, Heading2, Quote, Code, Image as ImageIcon,
  Eye, Save, X, Undo, Redo, Type
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
  initialValue?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  showSaveButton?: boolean;
  onChange?: (content: string) => void; // Added onChange prop
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '', 
  onSave, 
  onCancel,
  placeholder = 'Tulis konten Anda di sini...',
  showSaveButton = true,
  onChange // Destructure onChange
}) => {
  const [content, setContent] = useState(initialValue);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with initialValue when it changes
  useEffect(() => {
    setContent(initialValue);
    setHistory([initialValue]);
    setHistoryIndex(0);
  }, [initialValue]);

  // Auto-save to history
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(content);
        if (newHistory.length > 50) newHistory.shift(); // Limit history
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000);
    // Also call onChange if it exists
    if (onChange) {
      onChange(content);
    }
    return () => clearTimeout(timer);
  }, [content, history, historyIndex, onChange]);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText;
    let newCursorPos;

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
    
    // Find start of current line
    let lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;
    
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
    if (onSave) onSave(content);
  };

  const tools = [
    { icon: Undo, label: 'Undo (Ctrl+Z)', action: undo, disabled: historyIndex === 0 },
    { icon: Redo, label: 'Redo (Ctrl+Y)', action: redo, disabled: historyIndex === history.length - 1 },
    { type: 'divider' },
    { icon: Heading1, label: 'Heading 1', action: () => insertLine('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertLine('## ') },
    { type: 'type', label: 'Heading 3', action: () => insertLine('### ') },
    { type: 'divider' },
    { icon: Bold, label: 'Bold (Ctrl+B)', action: () => insertMarkdown('**', '**', 'teks tebal') },
    { icon: Italic, label: 'Italic (Ctrl+I)', action: () => insertMarkdown('*', '*', 'teks miring') },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: () => insertLine('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertLine('1. ') },
    { type: 'divider' },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)', 'teks link') },
    { icon: ImageIcon, label: 'Image', action: () => insertMarkdown('![', '](url)', 'alt text') },
    { icon: Code, label: 'Inline Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: Quote, label: 'Quote', action: () => insertLine('> ') },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          insertMarkdown('**', '**', 'teks tebal');
        } else if (e.key === 'i') {
          e.preventDefault();
          insertMarkdown('*', '*', 'teks miring');
        } else if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, insertMarkdown]); // Added dependencies to avoid stale closures

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between gap-2 flex-wrap bg-gray-50">
        <div className="flex items-center gap-1 flex-wrap">
          {tools.map((tool, index) => 
            tool.type === 'divider' ? (
              <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
            ) : (
              <button
                key={index}
                onClick={tool.action}
                disabled={tool.disabled}
                title={tool.label}
                className="p-2 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <tool.icon size={18} />
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${showPreview 
              ? 'bg-[#C5A059] text-white' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Eye size={16} />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X size={16} />
              Batal
            </button>
          )}
          
          {showSaveButton && onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#C5A059] text-white rounded-lg hover:bg-[#B08F4A] font-semibold"
            >
              <Save size={16} />
              Simpan
            </button>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-auto">
        {!showPreview ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-6 text-black text-base leading-relaxed focus:outline-none resize-none"
            style={{ minHeight: '400px' }}
          />
        ) : (
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>
                {content || '*Tidak ada konten untuk ditampilkan*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 bg-gray-50 flex justify-between items-center">
        <div>
          Markdown Editor • Gunakan toolbar atau keyboard shortcuts
        </div>
        <div>
          {content.length} karakter • {content.split(/\s+/).filter(w => w).length} kata
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
