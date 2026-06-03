import { useRef } from "react";
import type { HomeTransferState } from "../_lib/types";
import { styles } from "../_config/config";
import { UploadIcon, ShareIcon, CheckIcon } from "../_config/icons";
import { formatBytes } from "../_lib/format";

interface SenderFlowProps {
  t: HomeTransferState;
}

export function SenderFlow({ t }: SenderFlowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (t.phase === "role-selected") {
    return (
      <div className={styles.stack}>
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) t.addFiles(files);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={[styles.dropzone.base, styles.dropzone.idle].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.fileInput}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) t.addFiles(files);
              e.target.value = "";
            }}
            aria-label="选择文件"
          />
          <div className={styles.uploadIcon}>
            <UploadIcon />
          </div>
          {t.selectedFiles.length > 0 ? (
            <>
              <p className={styles.dropTitle}>{t.selectedFiles.length} 个文件已选择</p>
              <p className={styles.dropHint}>点击或拖拽添加更多文件</p>
            </>
          ) : (
            <>
              <p className={styles.dropTitle}>拖拽文件到此处或点击选择</p>
              <p className={styles.dropHint}>支持多选，可多次添加</p>
            </>
          )}
        </div>

        {t.selectedFiles.length > 0 && (
          <div className={styles.innerPanel}>
            <p className={styles.panelTitle}>待发送文件</p>
            <div className={styles.fileList}>
              {t.selectedFiles.map((file) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.fileRow}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileMeta}>{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>生成分享码</p>
          <p className={styles.panelHint}>选择文件后点击下方按钮，生成一次性 6 位分享码。</p>
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={t.createRoomSession}
              disabled={t.selectedFiles.length === 0}
              className={styles.button.primary}
            >
              <ShareIcon />
              生成分享码
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (t.phase === "room-creating") {
    return (
      <div className={styles.innerPanel}>
        <p className={styles.panelTitle}>正在创建房间</p>
        <p className={styles.panelHint}>正在申请一次性分享码...</p>
      </div>
    );
  }

  if (t.phase === "waiting-peer") {
    return (
      <div className={styles.flowGrid}>
        <div className={styles.codePanel}>
          <p className={styles.panelTitle}>分享码</p>
          <p className={styles.panelHint}>让接收方输入此码加入房间</p>
          <div className={styles.codeWrap}>
            <div className={styles.codeValue}>{t.shareCode}</div>
            <button type="button" onClick={t.copyShareCode} className={styles.button.secondary}>
              {t.copied ? <><CheckIcon /> 已复制</> : "复制"}
            </button>
          </div>
          <div className={styles.inlineMeta + " mt-3"}>
            <span>等待接收方加入...</span>
          </div>
        </div>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>状态</p>
          <div className={styles.metaList}>
            <div className={styles.metaTile}>
              <p className={styles.metaTileLabel}>房间码</p>
              <p className={styles.metaTileValue}>{t.shareCode}</p>
            </div>
            <div className={styles.metaTile}>
              <p className={styles.metaTileLabel}>状态</p>
              <p className={styles.metaTileValue}>等待中</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (t.phase === "negotiating" || t.phase === "ready") {
    return (
      <div className={styles.innerPanel}>
        <p className={styles.panelTitle}>
          {t.phase === "negotiating" ? "正在建立连接" : "等待接收方确认"}
        </p>
        <p className={styles.panelHint}>
          {t.phase === "negotiating"
            ? "正在与接收方建立局域网点对点连接..."
            : "接收方已连接，等待其确认保存位置后自动开始传输。"}
        </p>
      </div>
    );
  }

  return null;
}
