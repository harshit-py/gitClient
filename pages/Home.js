import React, { useEffect } from "react";
import { useGitStore } from "../utils/gitStore";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import CommitHistory from "../components/CommitHistory";
import FileChanges from "../components/FileChanges";
import FileContent from "../components/FileContent";
import { toast } from "sonner";

type Tab = 'working' | 'commit';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<Tab>('working');
  const { 
    repoInfo,
    commits,
    selectedCommitChanges,
    fileTree,
    loading,
    error,
    fetchRepoInfo,
    fetchCommits,
    fetchFileChanges,
    fetchFileTree,
    fetchFileContent,
    fetchWorkingChanges,
    selectedFile,
    fileContent,
    workingChanges
  } = useGitStore();

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchWorkingChanges(),
        fetchRepoInfo(),
        fetchCommits(),
        fetchFileTree()
      ]);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSelectCommit = async (hash: string) => {
    await fetchFileChanges(hash);
  };

  const handleSelectFile = async (path: string) => {
    await fetchFileContent(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !repoInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2">No Git Repository Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please open this app in a directory containing a Git repository.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />
      {repoInfo && (
        <Sidebar
          fileTree={fileTree}
          currentBranch={repoInfo.current_branch}
          branches={repoInfo.branches}
          onSelectFile={handleSelectFile}
        />
      )}
      {repoInfo && (
        <>
          <CommitHistory
            commits={commits}
            onSelectCommit={handleSelectCommit}
          />
          <div className="flex-1 flex flex-col">
            <div className="border-b bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => {
                    setActiveTab('working');
                    fetchWorkingChanges();
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'working' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-700 hover:text-gray-900'} focus:outline-none`}
                >
                  Working Changes
                </button>
                <button
                  onClick={() => {
                    setActiveTab('commit');
                    fetchFileChanges(commits[0]?.hash);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'commit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-700 hover:text-gray-900'} focus:outline-none`}
                >
                  Commit Changes
                </button>
              </div>
            </div>
            <FileChanges changes={activeTab === 'working' ? workingChanges : selectedCommitChanges} />
            <FileContent path={selectedFile} content={fileContent} />
          </div>
        </>
      )}
    </div>
  );
}
