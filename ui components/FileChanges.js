import React from 'react';
import { FileChange } from '../brain/data-contracts';

interface Props {
  changes: FileChange[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'A':
      return 'bg-green-100 text-green-800';
    case 'D':
      return 'bg-red-100 text-red-800';
    case 'M':
      return 'bg-yellow-100 text-yellow-800';
    case 'R':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default function FileChanges({ changes }: Props) {
  return (
    <div className="flex-1 bg-white p-4 overflow-y-auto">
      <h2 className="font-medium mb-4">Changes</h2>
      <div className="space-y-4">
        {changes.map((change) => (
          <div key={change.path} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{change.path}</span>
                <div className="flex items-center gap-2">
                  {change.staged !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded ${change.staged ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {change.staged ? 'Staged' : 'Unstaged'}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(change.status)}`}>
                    {change.status}
                  </span>
                </div>
              </div>
            </div>
            {change.diff && (
              <pre className="p-4 text-sm overflow-x-auto bg-gray-50 font-mono">
                {change.diff}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
