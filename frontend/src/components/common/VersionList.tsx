import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccounts } from "../../hooks/useAccounts";
import { getVersionMetadata } from "../../apple/versionLookup";
import type { Account, Software, VersionMetadata } from "../../types";

interface VersionListProps {
  account: Account;
  app: Software;
  versions: string[];
  downloadingVersion: string | null;
  onDownload: (versionId: string) => void;
  disabled?: boolean;
}

export default function VersionList({
  account,
  app,
  versions,
  downloadingVersion,
  onDownload,
  disabled = false,
}: VersionListProps) {
  const { t } = useTranslation();
  const { updateAccount } = useAccounts();

  const [versionMeta, setVersionMeta] = useState<
    Record<string, VersionMetadata>
  >({});
  const [loadingMeta, setLoadingMeta] = useState<Record<string, boolean>>({});

  async function handleLoadMeta(versionId: string) {
    if (versionMeta[versionId]) return;
    setLoadingMeta((prev) => ({ ...prev, [versionId]: true }));
    try {
      const result = await getVersionMetadata(account, app, versionId);
      setVersionMeta((prev) => ({ ...prev, [versionId]: result.metadata }));
      await updateAccount({ ...account, cookies: result.updatedCookies });
    } catch {
      // Silently fail for individual version metadata
    } finally {
      setLoadingMeta((prev) => ({ ...prev, [versionId]: false }));
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
      {versions.map((versionId) => {
        const meta = versionMeta[versionId];
        const isLoadingMeta = loadingMeta[versionId];
        const isDownloading = downloadingVersion === versionId;

        return (
          <div key={versionId} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {meta ? `v${meta.displayVersion}` : `ID: ${versionId}`}
              </p>
              {meta && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(meta.releaseDate).toLocaleDateString()}
                </p>
              )}
              {!meta && !isLoadingMeta && (
                <button
                  type="button"
                  onClick={() => handleLoadMeta(versionId)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 transition-colors"
                >
                  {t("search.versions.loadDetails")}
                </button>
              )}
              {isLoadingMeta && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {t("search.versions.loading")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDownload(versionId)}
              disabled={disabled || isDownloading || downloadingVersion !== null}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isDownloading
                ? t("search.versions.downloading")
                : t("search.versions.download")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
