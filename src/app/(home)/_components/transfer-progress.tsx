import type { HomeTransferState } from "../_lib/types";
import { styles } from "../_config/config";
import { formatBytes, formatEta, formatSpeed } from "../_lib/format";

interface TransferProgressProps {
  t: HomeTransferState;
}

export function TransferProgress({ t }: TransferProgressProps) {
  if (t.phase === "transferring") {
    return (
      <div className={styles.flowGrid}>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>正在传输</p>
          <div className={styles.progressWrap + " mt-4"}>
            <div className={styles.progressBarOuter}>
              <div
                className={styles.progressBarInner}
                style={{
                  width: t.progress.totalBytes > 0
                    ? `${Math.min((t.progress.transferredBytes / t.progress.totalBytes) * 100, 100).toFixed(1)}%`
                    : "0%",
                }}
              />
            </div>
            <div className={styles.progressStats}>
              <div className={styles.progressStat}>
                <p className={styles.progressStatLabel}>已传输</p>
                <p className={styles.progressStatValue}>
                  {formatBytes(t.progress.transferredBytes)} / {formatBytes(t.progress.totalBytes)}
                </p>
              </div>
              <div className={styles.progressStat}>
                <p className={styles.progressStatLabel}>速度</p>
                <p className={styles.progressStatValue}>{formatSpeed(t.progress.speedBytesPerSecond)}</p>
              </div>
              <div className={styles.progressStat}>
                <p className={styles.progressStatLabel}>剩余时间</p>
                <p className={styles.progressStatValue}>{formatEta(t.progress.etaSeconds)}</p>
              </div>
              <div className={styles.progressStat}>
                <p className={styles.progressStatLabel}>文件</p>
                <p className={styles.progressStatValue}>
                  {t.progress.completedFiles} / {t.progress.totalFiles}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>当前文件</p>
          <p className={styles.panelHint}>{t.progress.currentFileName ?? "等待开始..."}</p>
          {t.progress.currentFileBytes > 0 && (
            <div className="mt-3">
              <div className={styles.progressBarOuter}>
                <div
                  className={styles.progressBarInner}
                  style={{
                    width: `${Math.min((t.progress.currentFileTransferredBytes / t.progress.currentFileBytes) * 100, 100).toFixed(1)}%`,
                  }}
                />
              </div>
              <p className={styles.inlineMeta + " mt-2"}>
                {formatBytes(t.progress.currentFileTransferredBytes)} / {formatBytes(t.progress.currentFileBytes)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
