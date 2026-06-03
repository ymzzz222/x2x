import type { HomeTransferState } from "../_lib/types";
import { styles } from "../_config/config";
import { formatBytes } from "../_lib/format";

interface ReceiverFlowProps {
  t: HomeTransferState;
}

export function ReceiverFlow({ t }: ReceiverFlowProps) {
  if (t.phase === "role-selected") {
    return (
      <div className={styles.stack}>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>输入分享码</p>
          <p className={styles.panelHint}>输入发送方提供的 6 位数字分享码</p>
          <div className="mt-4">
            <input
              type="text"
              maxLength={6}
              value={t.shareCodeInput}
              placeholder="000000"
              className={styles.codeInput}
              onChange={(e) => t.setShareCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={t.joinRoomSession}
              disabled={t.shareCodeInput.length !== 6}
              className={styles.button.primary}
            >
              加入房间
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (t.phase === "joining-room") {
    return (
      <div className={styles.innerPanel}>
        <p className={styles.panelTitle}>正在加入房间</p>
        <p className={styles.panelHint}>正在连接到发送方的房间...</p>
      </div>
    );
  }

  if (t.phase === "negotiating") {
    return (
      <div className={styles.innerPanel}>
        <p className={styles.panelTitle}>正在建立连接</p>
        <p className={styles.panelHint}>已加入房间，正在与发送方建立局域网点对点连接...</p>
      </div>
    );
  }

  if (t.phase === "ready" && t.manifest) {
    if (t.mode === "text") {
      return (
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>接收文本</p>
          <p className={styles.panelHint}>发送方已准备好文本，点击确认开始接收。</p>
          <div className={styles.actionRow}>
            <button type="button" onClick={t.confirmReceiverReady} className={styles.button.primary}>
              确认接收
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.flowGrid}>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>文件清单</p>
          <p className={styles.panelHint}>
            发送方准备了 {t.manifest.files.length} 个文件，共 {formatBytes(t.manifest.totalBytes)}
          </p>
          <div className={styles.fileList}>
            {t.manifest.files.map((file) => (
              <div key={file.id} className={styles.fileRow}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileMeta}>{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>确认接收</p>
          <p className={styles.panelHint}>
            {t.capability.canPickDirectory
              ? "点击后选择保存文件的目录"
              : "当前浏览器不支持目录选择，完成后将提供下载链接"}
          </p>
          <div className={styles.actionRow}>
            <button type="button" onClick={t.confirmReceiverReady} className={styles.button.primary}>
              {t.capability.canPickDirectory ? "选择目录并接收" : "确认接收"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
