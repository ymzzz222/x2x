import type { HomeTransferState } from "../_lib/types";
import { styles } from "../_config/config";
import { ShareIcon } from "../_config/icons";

interface SenderTextInputProps {
  t: HomeTransferState;
}

export function SenderTextInput({ t }: SenderTextInputProps) {
  if (t.phase === "role-selected") {
    return (
      <div className={styles.stack}>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>输入文本</p>
          <p className={styles.panelHint}>输入要发送的文本内容，然后生成分享码。</p>
          <div className="mt-4">
            <textarea
              value={t.senderText}
              onChange={(e) => t.setSenderText(e.target.value)}
              className="min-h-[200px] w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/18 focus:border-white/20 resize-none"
              placeholder="在此输入文本..."
            />
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={t.createRoomSession}
              disabled={!t.senderText.trim()}
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
              {t.copied ? "已复制" : "复制"}
            </button>
          </div>
          <div className={styles.inlineMeta + " mt-3"}>
            <span>等待接收方加入...</span>
          </div>
        </div>
        <div className={styles.innerPanel}>
          <p className={styles.panelTitle}>待发送文本</p>
          <p className={styles.panelHint}>共 {new TextEncoder().encode(t.senderText).byteLength} 字节</p>
          <div className="mt-3 max-h-[160px] overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
            <p className="whitespace-pre-wrap break-all text-xs text-white/60">{t.senderText}</p>
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
            : "接收方已连接，等待其确认后自动开始传输。"}
        </p>
      </div>
    );
  }

  return null;
}
