import React from 'react';
import { FileTreeItem } from '../brain/data-contracts';
import { FolderIcon, FileIcon, GitBranchIcon } from 'lucide-react';

interface Props {
  fileTree: FileTreeItem[];
  currentBranch: string;
  branches: string[];
  onSelectFile: (path: string) => void;
}

const TreeItem: React.FC<{ item: FileTreeItem; onSelect: (path: string) => void }> = ({ item, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="ml-4">
      <div 
        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
        onClick={() => item.type === 'file' ? onSelect(item.path) : setIsOpen(!isOpen)}
      >
        {item.type === 'dir' ? (
          <FolderIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <FileIcon className="w-4 h-4 text-gray-500" />
        )}
        <span className="text-sm">{item.path}</span>
      </div>
      {isOpen && item.children && (
        <div className="ml-2">
          {item.children.map((child) => (
            <TreeItem key={child.path} item={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ fileTree, currentBranch, branches, onSelectFile }: Props) {
  return (
    <div className="w-64 border-r bg-white p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <GitBranchIcon className="w-4 h-4" />
          <span className="font-medium">Current Branch</span>
        </div>
        <select 
          className="w-full p-2 border rounded bg-white"
          value={currentBranch}
        >
          {branches.map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Files</h3>
        {fileTree.map((item) => (
          <TreeItem key={item.path} item={item} onSelect={onSelectFile} />
        ))}
      </div>
    </div>
  );
}
