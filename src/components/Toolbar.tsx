/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Heading, Bold, Italic, Strikethrough, 
  Code, Terminal, Quote, List, ListOrdered, CheckSquare, 
  Table2, Link2, Image as ImageIcon, Minus, Eraser,
  Maximize2, Minimize2, FileUp, Download, Copy, Sun, Moon, Globe, Github, Smartphone, Undo2, Redo2
} from 'lucide-react';
import { translations } from '../utils/translations';

interface ToolbarProps {
  getTextarea: () => HTMLTextAreaElement | null;
  onContentChange: (newValue: string) => void;
  onClear: () => void;
  language: 'en' | 'fa';
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onImportFile: (file: File) => void;
  onExport: (format: 'html' | 'docx' | 'txt' | 'md') => void;
  exportStatus: 'idle' | 'converting' | 'success' | 'error';
  isInstallable: boolean;
  onTriggerInstall: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleLanguage: () => void;
  onOpenUrlImport: () => void;
  onOpenIosInstallGuide: () => void;
  isStandalone: boolean;
  onOpenGithubModal: () => void;
  onCopyPlainText: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  getTextarea,
  onContentChange,
  onClear,
  language,
  isFullScreen,
  onToggleFullScreen,
  onImportFile,
  onExport,
  exportStatus,
  isInstallable,
  onTriggerInstall,
  darkMode,
  onToggleDarkMode,
  onToggleLanguage,
  onOpenUrlImport,
  onOpenIosInstallGuide,
  isStandalone,
  onOpenGithubModal,
  onCopyPlainText
}) => {
  const t = translations[language];
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showImportMenu, setShowImportMenu] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // General Hotkey capturing
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (!cmdOrCtrl) return;

      const key = e.key.toLowerCase();
      let handled = false;

      if (key === 'z' && !e.shiftKey) {
        // Handled by browser natively in textarea, but if elsewhere:
        const textarea = getTextarea();
        if (textarea && document.activeElement !== textarea) {
          textarea.focus();
          document.execCommand('undo');
          handled = true;
        }
      } else if ((key === 'y') || (key === 'z' && e.shiftKey)) {
        const textarea = getTextarea();
        if (textarea && document.activeElement !== textarea) {
          textarea.focus();
          document.execCommand('redo');
          handled = true;
        }
      } else if (key === 'b') {
        applyFormat('**', '**', 'bold text'); handled = true;
      } else if (key === 'i' && !e.shiftKey) {
        applyFormat('*', '*', 'italic text'); handled = true;
      } else if (key === 's' && e.shiftKey) {
        applyFormat('~~', '~~', 'strikethrough text'); handled = true;
      } else if (key === 'e' && !e.shiftKey) {
        applyFormat('`', '`', 'code'); handled = true;
      } else if (key === 'e' && e.shiftKey) {
        applyFormat('```javascript\n', '\n```', '// paste code snippet here'); handled = true;
      } else if (key === 'q') {
        insertBlockFormat('> '); handled = true;
      } else if (key === '8' && e.shiftKey) { // * character for bullet
        insertBlockFormat('- '); handled = true;
      } else if (key === '7' && e.shiftKey) { // & character basically, but we use numbers
        insertBlockFormat('1. '); handled = true;
      } else if (key === 'l' && e.shiftKey) {
        insertBlockFormat('- [ ] '); handled = true;
      } else if (key === 't' && !e.shiftKey) {
        insertBlockFormat('| Column 1 | Column 2 |\n| :--- | :---: |\n| Row 1 Col 1 | Row 1 Col 2 |'); handled = true;
      } else if (key === 'k') {
        applyFormat('[', '](https://example.com)', 'link label'); handled = true;
      } else if (key === 'i' && e.shiftKey) {
        applyFormat('![', '](https://images.unsplash.com/photo-1457369804613-52c61a468e7d)', 'image caption'); handled = true;
      } else if (key === 'h' && !e.shiftKey) {
        insertBlockFormat('---'); handled = true;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getTextarea, onContentChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImportFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyFormat = (syntaxStart: string, syntaxEnd: string, placeholder: string) => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    if (selectedText.length > 0) {
      replacement = `${syntaxStart}${selectedText}${syntaxEnd}`;
      cursorOffset = syntaxStart.length + selectedText.length + syntaxEnd.length;
    } else {
      replacement = `${syntaxStart}${placeholder}${syntaxEnd}`;
      cursorOffset = syntaxStart.length + placeholder.length;
    }

    textarea.focus();
    textarea.setSelectionRange(start, end);
    
    // Use execCommand to preserve browser native Undo/Redo stack
    const success = document.execCommand('insertText', false, replacement);
    
    // Fallback if execCommand fails (e.g. some mobile browsers)
    if (!success) {
      const newValue = text.substring(0, start) + replacement + text.substring(end);
      onContentChange(newValue);
    } else {
      onContentChange(textarea.value);
    }

    // Refocus and place cursor elegantly
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const insertBlockFormat = (syntax: string) => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    
    // Check if we are at the start of a line, if not add a newline prefix
    const needsPrevNewline = start > 0 && text[start - 1] !== '\n';
    const prefix = needsPrevNewline ? '\n' : '';
    const formattedText = `${prefix}${syntax}\n`;

    textarea.focus();
    textarea.setSelectionRange(start, start);
    
    const success = document.execCommand('insertText', false, formattedText);
    
    if (!success) {
      const newValue = text.substring(0, start) + formattedText + text.substring(start);
      onContentChange(newValue);
    } else {
      onContentChange(textarea.value);
    }

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 13 formatting items (excluding heading which is rendered as custom dropdown)
  const formattingOptions = [
    {
      label: 'Bold',
      hotkey: 'Ctrl+B',
      icon: <Bold className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('**', '**', 'bold text')
    },
    {
      label: 'Italic',
      hotkey: 'Ctrl+I',
      icon: <Italic className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('*', '*', 'italic text')
    },
    {
      label: 'Strikethrough',
      hotkey: 'Ctrl+Shift+S',
      icon: <Strikethrough className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('~~', '~~', 'strikethrough text')
    },
    {
      label: 'Inline Code',
      hotkey: 'Ctrl+E',
      icon: <Code className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('`', '`', 'code')
    },
    {
      label: 'Code Block',
      hotkey: 'Ctrl+Shift+E',
      icon: <Terminal className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('```javascript\n', '\n```', '// paste code snippet here')
    },
    {
      label: 'Blockquote',
      hotkey: 'Ctrl+Q',
      icon: <Quote className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('> blockquote text')
    },
    {
      label: 'Bullet List',
      hotkey: 'Ctrl+Shift+8',
      icon: <List className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('- Item 1\n- Item 2')
    },
    {
      label: 'Numbered List',
      hotkey: 'Ctrl+Shift+7',
      icon: <ListOrdered className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('1. First item\n2. Second item')
    },
    {
      label: 'Task List',
      hotkey: 'Ctrl+Shift+L',
      icon: <CheckSquare className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('- [ ] Complete task 1\n- [ ] Complete task 2')
    },
    {
      label: 'GFM Table',
      hotkey: 'Ctrl+T',
      icon: <Table2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('| Column 1 | Column 2 |\n| :--- | :---: |\n| Row 1 Col 1 | Row 1 Col 2 |')
    },
    {
      label: 'Link',
      hotkey: 'Ctrl+K',
      icon: <Link2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('[', '](https://example.com)', 'link label')
    },
    {
      label: 'Image Link',
      hotkey: 'Ctrl+Shift+I',
      icon: <ImageIcon className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => applyFormat('![', '](https://images.unsplash.com/photo-1457369804613-52c61a468e7d)', 'image caption')
    },
    {
      label: 'Horizontal Divider',
      hotkey: 'Ctrl+H',
      icon: <Minus className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />,
      action: () => insertBlockFormat('---')
    }
  ];

  return (
    <div className="flex flex-col gap-1 md:gap-1.5 p-1 sm:p-2 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 sticky top-0 z-40 select-none">
      
      {/* Row 1: Editing Toolbar Icons (Exactly 14 formatting elements: 1 Dropdown + 13 Buttons, flex-nowrap to never cause wrap layouts) */}
      <div className="flex flex-row w-full justify-between items-center gap-0.5 sm:gap-1 select-none flex-nowrap overflow-visible">
        
        {/* Heading Level Dropdown - Saved as single H logo */}
        <div className="relative flex-1 shrink min-w-0 flex items-center justify-center">
          <button
            onClick={() => { setShowHeadingMenu(!showHeadingMenu); setShowImportMenu(false); setShowExportMenu(false); }}
            className={`w-full flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-655 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent ${showHeadingMenu ? 'bg-slate-200 dark:bg-zinc-800' : ''}`}
            title="Headings"
            type="button"
          >
            <Heading className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
          </button>
          
          {showHeadingMenu && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowHeadingMenu(false)} />
              <div className="absolute mt-1 top-full w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50 start-0 text-start overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      insertBlockFormat('#'.repeat(level) + ` Heading ${level}`);
                      setShowHeadingMenu(false);
                    }}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                    type="button"
                  >
                    <span className="font-mono text-[9px] text-zinc-400">H{level}</span>
                    <span>{language === 'fa' ? `تیتر ${level}` : `Heading ${level}`}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Remaining 13 Formatter items */}
        {formattingOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.action}
            className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
            title={`${opt.label} (${opt.hotkey})`}
            type="button"
          >
            {opt.icon}
          </button>
        ))}
      </div>

      {/* Row 2: Management Icons (Exactly 9 elements, flex-nowrap to never cause wrap layouts) */}
      <div className="flex flex-row w-full justify-between items-center gap-0.5 sm:gap-1 select-none flex-nowrap overflow-visible pt-1 mt-0.5 border-t border-slate-200/40 dark:border-zinc-800/40">
        
        {/* 1. Import Document (Dropdown Button) */}
        <div className="relative flex-1 shrink min-w-0 flex items-center justify-center">
          <button
            onClick={() => { setShowImportMenu(!showImportMenu); setShowExportMenu(false); setShowHeadingMenu(false); }}
            className={`w-full flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent ${showImportMenu ? 'bg-slate-200 dark:bg-zinc-800' : ''}`}
            title={t.importDoc}
            type="button"
          >
            <FileUp className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
          </button>
          
          {showImportMenu && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowImportMenu(false)} />
              <div className="absolute mt-1 top-full w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg shadow-xl py-1 z-50 start-0 text-start overflow-hidden">
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowImportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.importFromLocal}</span>
                </button>
                <button
                  onClick={() => { onOpenUrlImport(); setShowImportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.importFromUrl}</span>
                </button>
              </div>
            </>
          )}
        </div>

        <input
          id="toolbarFileUploader"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md,text/markdown,.txt,text/plain,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />

        {/* 2. Export Document (Dropdown Button) */}
        <div className="relative flex-1 shrink min-w-0 flex items-center justify-center">
          <button
            onClick={() => { setShowExportMenu(!showExportMenu); setShowImportMenu(false); setShowHeadingMenu(false); }}
            className={`w-full flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent ${showExportMenu ? 'bg-slate-200 dark:bg-zinc-850' : ''}`}
            title={t.exportDoc}
            type="button"
          >
            <Download className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
            {exportStatus === 'converting' && (
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
              </span>
            )}
          </button>

          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowExportMenu(false)} />
              <div className="absolute mt-1 top-full w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-lg shadow-xl py-1 z-50 start-0 text-start overflow-hidden">
                <button
                  onClick={() => { onExport('md'); setShowExportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <span className="font-mono text-slate-400 text-[9px]">.md</span>
                  <span>{t.rawMarkdown}</span>
                </button>
                <button
                  onClick={() => { onExport('html'); setShowExportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <span className="font-mono text-indigo-500 font-bold text-[9px]">HTML</span>
                  <span>{t.htmlExport}</span>
                </button>
                <button
                  onClick={() => { onExport('docx'); setShowExportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <span className="font-mono text-sky-505 font-bold text-[9px]">Word</span>
                  <span>{t.wordExport}</span>
                </button>
                <button
                  onClick={() => { onExport('txt'); setShowExportMenu(false); }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer font-sans-fa border-0 outline-none bg-transparent"
                  type="button"
                >
                  <span className="font-mono text-slate-400 text-[9px]">.txt</span>
                  <span>{t.textExport}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 3. Copy Plain Text (Icon Button) */}
        <button
          onClick={onCopyPlainText}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title={t.copyPlainText}
          type="button"
        >
          <Copy className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        {/* 3.1 Undo */}
        <button
          onClick={() => {
            const textarea = getTextarea();
            if (textarea) textarea.focus();
            document.execCommand('undo');
          }}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title={`${t.undo || 'Undo'} (Ctrl+Z)`}
          type="button"
        >
          <Undo2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        {/* 3.2 Redo */}
        <button
          onClick={() => {
            const textarea = getTextarea();
            if (textarea) textarea.focus();
            document.execCommand('redo');
          }}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title={`${t.redo || 'Redo'} (Ctrl+Y)`}
          type="button"
        >
          <Redo2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        {/* 4. Erase / Clear Canvas (Icon Button) */}
        <button
          onClick={onClear}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-650 dark:text-zinc-450 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title={t.clearWorkspace}
          type="button"
        >
          <Eraser className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-slate-250 dark:bg-zinc-800 shrink-0 self-center mx-0.5" />

        {/* 5. Install App (PWA) (Icon Button, if not standalone) */}
        <button
          onClick={isInstallable ? onTriggerInstall : onOpenIosInstallGuide}
          className={`flex-1 shrink min-w-0 flex items-center justify-center p-1 rounded-md transition-colors cursor-pointer border-0 outline-none bg-transparent ${isStandalone ? 'opacity-30 pointer-events-none' : 'text-slate-650 dark:text-zinc-450 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'}`}
          title={isInstallable ? "Install App" : "Offline Setup Guide"}
          type="button"
          disabled={isStandalone}
        >
          <Smartphone className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        {/* 6. Dark/Light Mode toggle (Icon Button) */}
        <button
          onClick={onToggleDarkMode}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title="Toggle Theme"
          type="button"
        >
          {darkMode ? <Sun className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-amber-500 font-bold" /> : <Moon className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />}
        </button>

        {/* 7. Language Toggle (Icon Button) */}
        <button
          onClick={onToggleLanguage}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title="Switch Language"
          type="button"
        >
          <Globe className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

        {/* 8. Fullscreen Toggle (Icon Button) */}
        <button
          onClick={onToggleFullScreen}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-650 dark:text-zinc-450 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title="Fullscreen"
          type="button"
        >
          {isFullScreen ? <Minimize2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 text-indigo-505" /> : <Maximize2 className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />}
        </button>

        <div className="w-[1px] h-3.5 bg-slate-250 dark:bg-zinc-800 shrink-0 self-center mx-0.5" />

        {/* 9. GitHub Star Invitation (Icon Button) */}
        <button
          onClick={onOpenGithubModal}
          className="flex-1 shrink min-w-0 flex items-center justify-center p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-655 dark:text-zinc-455 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer border-0 outline-none bg-transparent"
          title="GitHub Star"
          type="button"
        >
          <Github className="w-[3.5vw] h-[3.5vw] min-w-3.5 min-h-3.5 max-w-4.5 max-h-4.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5" />
        </button>

      </div>
      
    </div>
  );
};
