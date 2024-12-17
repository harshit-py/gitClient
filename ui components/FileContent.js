import React from 'react';

interface Props {
  path: string;
  content: string | null;
}

export default function FileContent({ path, content }: Props) {
  if (!content) return null;

  return (
    <div className="flex-1 bg-white p-4 overflow-y-auto">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 border-b">
          <span className="font-mono text-sm">{path}</span>
        </div>
        <pre className="p-4 text-sm overflow-x-auto bg-gray-50 font-mono whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
}
