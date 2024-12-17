import { create } from 'zustand';
import brain from 'brain';
import { CommitInfo, FileChange, FileTreeItem, RepoInfo } from '../brain/data-contracts';

interface GitStore {
  workingChanges: FileChange[];
  selectedFile: string | null;
  fileContent: string | null;
  repoInfo: RepoInfo | null;
  commits: CommitInfo[];
  selectedCommitChanges: FileChange[];
  fileTree: FileTreeItem[];
  loading: boolean;
  error: string | null;
  fetchRepoInfo: () => Promise<void>;
  fetchCommits: () => Promise<void>;
  fetchFileChanges: (commitHash: string) => Promise<void>;
  fetchFileTree: () => Promise<void>;
}

export const useGitStore = create<GitStore>((set) => ({
  workingChanges: [],
  selectedFile: null,
  fileContent: null,
  repoInfo: null,
  commits: [],
  selectedCommitChanges: [],
  fileTree: [],
  loading: false,
  error: null,

  fetchRepoInfo: async () => {
    try {
      set({ loading: true, error: null });
      const response = await brain.get_repo_info();
      const data = await response.json();
      set({ repoInfo: data });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch repository info';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchCommits: async () => {
    try {
      set({ loading: true, error: null });
      const response = await brain.get_commits();
      const data = await response.json();
      set({ commits: data });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch commits';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchFileChanges: async (commitHash: string) => {
    try {
      set({ loading: true, error: null });
      const response = await brain.get_file_changes({ commit_hash: commitHash });
      const data = await response.json();
      set({ selectedCommitChanges: data });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch file changes';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchFileContent: async (path: string) => {
    try {
      set({ loading: true, error: null, selectedFile: path });
      const response = await brain.get_file_content({ path });
      const data = await response.json();
      set({ fileContent: data.content });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch file content';
      set({ error: message, fileContent: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchWorkingChanges: async () => {
    try {
      set({ loading: true, error: null });
      const response = await brain.get_working_changes();
      const data = await response.json();
      set({ workingChanges: data });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch working changes';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchFileTree: async () => {
    try {
      set({ loading: true, error: null });
      const response = await brain.get_file_tree();
      const data = await response.json();
      set({ fileTree: data });
    } catch (error: any) {
      const message = error.response?.status === 404
        ? error.response.data?.detail
        : 'Failed to fetch file tree';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
}));
