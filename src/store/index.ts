import { create } from 'zustand';

export interface SubmissionData {
  problemTitle: string;
  problemSlug: string;
  code: string;
  language: string;
  status: string;
  timestamp: number;
  difficulty: string;
  url: string;
}

export interface GitHubConfig {
  token: string;
  username: string;
  repositoryName: string;
  repositoryUrl: string;
  isConnected: boolean;
}

interface AppState {
  // GitHub configuration
  githubConfig: GitHubConfig;
  setGitHubConfig: (config: Partial<GitHubConfig>) => void;
  
  // Submissions
  submissions: SubmissionData[];
  addSubmission: (submission: SubmissionData) => void;
  
  // Sync status
  isSyncing: boolean;
  setSyncing: (syncing: boolean) => void;
  
  // Settings
  autoSync: boolean;
  setAutoSync: (autoSync: boolean) => void;
  
  // Initialize store from Chrome storage
  initializeFromStorage: () => Promise<void>;
  
  // Save to Chrome storage
  saveToStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  githubConfig: {
    token: '',
    username: '',
    repositoryName: 'leetcode-solutions',
    repositoryUrl: '',
    isConnected: false,
  },
  
  submissions: [],
  isSyncing: false,
  autoSync: true,
  
  // Actions
  setGitHubConfig: (config) => {
    set((state) => ({
      githubConfig: { ...state.githubConfig, ...config }
    }));
    get().saveToStorage();
  },
  
  addSubmission: (submission) => {
    set((state) => ({
      submissions: [submission, ...state.submissions]
    }));
    get().saveToStorage();
  },
  
  setSyncing: (syncing) => {
    set({ isSyncing: syncing });
  },
  
  setAutoSync: (autoSync) => {
    set({ autoSync });
    get().saveToStorage();
  },
  
  // Initialize from Chrome storage
  initializeFromStorage: async () => {
    try {
      const result = await chrome.storage.local.get([
        'githubConfig',
        'submissions',
        'autoSync'
      ]);
      
      if (result.githubConfig) {
        set({ githubConfig: result.githubConfig });
      }
      
      if (result.submissions) {
        set({ submissions: result.submissions });
      }
      
      if (result.autoSync !== undefined) {
        set({ autoSync: result.autoSync });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  },
  
  // Save to Chrome storage
  saveToStorage: async () => {
    try {
      const state = get();
      await chrome.storage.local.set({
        githubConfig: state.githubConfig,
        submissions: state.submissions,
        autoSync: state.autoSync
      });
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
}));