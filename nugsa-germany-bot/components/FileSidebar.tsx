import React from 'react';
import { FileDocument } from '../types';
import { FileText, FileCode, FileJson, Database, Lock } from 'lucide-react';

interface FileSidebarProps {
  files: FileDocument[];
  onFilesChange: (files: FileDocument[]) => void;
  isOpen: boolean;
}

export const FileSidebar: React.FC<FileSidebarProps> = ({ files, isOpen }) => {
  const getIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson size={16} className="text-yellow-400" />;
    if (name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.tsx')) return <FileCode size={16} className="text-blue-400" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  const totalChars = files.reduce((acc, f) => acc + f.content.length, 0);
  // Rough estimate: 4 chars per token
  const estimatedTokens = Math.round(totalChars / 4);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 flex flex-col
    `}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xl">
          <Database size={24} />
          <span>DocuMind</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Verified Knowledge Base
            </h3>
            <Lock size={12} className="text-gray-600" />
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 mb-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              This chatbot is pre-loaded with official documentation. File uploads are disabled to ensure response accuracy.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id} className="group flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 transition-colors">
              <div className="flex items-center space-x-3 overflow-hidden">
                {getIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-gray-500">
                No verified documents loaded.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Context Usage</span>
          <span>{estimatedTokens.toLocaleString()} tokens</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((estimatedTokens / 1000000) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};