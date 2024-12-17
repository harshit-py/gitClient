import React from 'react';
import { CommitInfo } from '../brain/data-contracts';
import { GitCommitIcon } from 'lucide-react';

interface Props {
  commits: CommitInfo[];
  onSelectCommit: (hash: string) => void;
}

export default function CommitHistory({ commits, onSelectCommit }: Props) {
  return (
    <div className="border-r bg-white w-96 p-4 overflow-y-auto">
      <h2 className="font-medium mb-4">Commit History</h2>
      <div className="space-y-4">
        {commits.map((commit) => (
          <div
            key={commit.hash}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectCommit(commit.hash)}
          >
            <div className="flex items-center gap-2 mb-2">
              <GitCommitIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-mono text-gray-500">
                {commit.hash.substring(0, 7)}
              </span>
            </div>
            <p className="text-sm mb-2">{commit.message}</p>
            <div className="text-xs text-gray-500">
              <p>{commit.author}</p>
              <p>{new Date(commit.date).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
