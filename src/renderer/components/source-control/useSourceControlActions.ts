import { useCallback, useState } from 'react';
import { toastManager } from '@/components/ui/toast';
import { useGitCommit, useGitDiscard, useGitStage, useGitUnstage } from '@/hooks/useSourceControl';
import { useI18n } from '@/i18n';
import { useSourceControlStore } from '@/stores/sourceControl';

export interface ConfirmAction {
  path: string;
  type: 'discard' | 'delete';
}

interface UseSourceControlActionsOptions {
  rootPath: string | undefined;
  stagedCount: number;
}

export function useSourceControlActions({ rootPath, stagedCount }: UseSourceControlActionsOptions) {
  const { t } = useI18n();
  const { selectedFile, setSelectedFile } = useSourceControlStore();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const stageMutation = useGitStage();
  const unstageMutation = useGitUnstage();
  const discardMutation = useGitDiscard();
  const commitMutation = useGitCommit();

  const handleStage = useCallback(
    (paths: string[]) => {
      if (rootPath) {
        stageMutation.mutate({ workdir: rootPath, paths });
      }
    },
    [rootPath, stageMutation]
  );

  const handleUnstage = useCallback(
    (paths: string[]) => {
      if (rootPath) {
        unstageMutation.mutate({ workdir: rootPath, paths });
      }
    },
    [rootPath, unstageMutation]
  );

  const handleDiscard = useCallback((path: string) => {
    setConfirmAction({ path, type: 'discard' });
  }, []);

  const handleDeleteUntracked = useCallback((path: string) => {
    setConfirmAction({ path, type: 'delete' });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!rootPath || !confirmAction) return;

    try {
      if (confirmAction.type === 'discard') {
        discardMutation.mutate({ workdir: rootPath, path: confirmAction.path });
      } else {
        // Delete untracked file
        await window.electronAPI.file.delete(`${rootPath}/${confirmAction.path}`, {
          recursive: false,
        });
        // Invalidate queries to refresh the file list
        stageMutation.mutate({ workdir: rootPath, paths: [] });
      }

      // Clear selection if affecting selected file
      if (selectedFile?.path === confirmAction.path) {
        setSelectedFile(null);
      }
    } catch (error) {
      toastManager.add({
        title: confirmAction.type === 'discard' ? t('Discard failed') : t('Delete failed'),
        description: error instanceof Error ? error.message : t('Unknown error'),
        type: 'error',
        timeout: 5000,
      });
    }

    setConfirmAction(null);
  }, [rootPath, confirmAction, discardMutation, selectedFile, setSelectedFile, stageMutation, t]);

  const handleCommit = useCallback(
    async (message: string) => {
      if (!rootPath || stagedCount === 0) return;

      try {
        await commitMutation.mutateAsync({ workdir: rootPath, message });
        toastManager.add({
          title: t('Commit successful'),
          description: t('Committed {{count}} files', { count: stagedCount }),
          type: 'success',
          timeout: 3000,
        });
        setSelectedFile(null);
      } catch (error) {
        toastManager.add({
          title: t('Commit failed'),
          description: error instanceof Error ? error.message : t('Unknown error'),
          type: 'error',
          timeout: 5000,
        });
      }
    },
    [rootPath, stagedCount, commitMutation, setSelectedFile, t]
  );

  return {
    // Actions
    handleStage,
    handleUnstage,
    handleDiscard,
    handleDeleteUntracked,
    handleCommit,
    // Confirmation dialog
    confirmAction,
    setConfirmAction,
    handleConfirmAction,
    // Mutation state
    isCommitting: commitMutation.isPending,
  };
}
