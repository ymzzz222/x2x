"use client";

import { useState } from "react";
import Grainient from "@/components/grainient";
import { grainientConfig, styles, type NavTab } from "./_config/config";
import { useHomeTransfer } from "./_hooks/use-home-transfer";
import { Sidebar } from "./_components/sidebar";
import { RoleSelection } from "./_components/role-selection";
import { SenderFlow } from "./_components/sender-flow";
import { SenderTextInput } from "./_components/sender-text-input";
import { ReceiverFlow } from "./_components/receiver-flow";
import { TransferProgress } from "./_components/transfer-progress";
import { formatBytes } from "./_lib/format";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("file");
  const t = useHomeTransfer(activeTab === "text" ? "text" : "file");

  const isIdle = t.phase === "idle";
  const isTerminal = ["completed", "cancelled", "failed"].includes(t.phase);
  const isSender = t.role === "sender";
  const isReceiver = t.role === "receiver";
  const showBack = !isIdle;

  return (
    <main className={styles.main}>
      <Grainient {...grainientConfig} />

      <section className={styles.section}>
        <div className={styles.container}>
          <Sidebar
            showBack={showBack}
            onBack={t.resetLocalState}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className={styles.centeredContent}>
            {t.capability.warning && (
              <div className={styles.capabilityCallout}>{t.capability.warning}</div>
            )}

            {t.errorMessage && !isTerminal && (
              <div className={styles.errorState}>{t.errorMessage}</div>
            )}

            {isIdle && <RoleSelection onSelect={t.selectRole} />}

            {isSender && t.mode === "file" && <SenderFlow t={t} />}
            {isSender && t.mode === "text" && <SenderTextInput t={t} />}

            {isReceiver && <ReceiverFlow t={t} />}

            {t.phase === "transferring" && <TransferProgress t={t} />}

            {t.phase === "completed" && (
              <div className={styles.innerPanel}>
                <p className={styles.panelTitle}>传输完成</p>
                <p className={styles.panelHint}>{t.statusMessage}</p>

                {t.mode === "text" && t.receivedText && (
                  <div className="mt-4">
                    <p className={styles.panelTitle + " text-base"}>收到的文本</p>
                    <div className="mt-2 max-h-[300px] overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                      <p className="whitespace-pre-wrap break-all text-sm text-white/80">{t.receivedText}</p>
                    </div>
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(t.receivedText!)}
                        className={styles.button.secondary}
                      >
                        复制文本
                      </button>
                    </div>
                  </div>
                )}

                {t.mode === "file" && t.downloadArtifacts.length > 0 && (
                  <div className={styles.linkList + " mt-4"}>
                    {t.downloadArtifacts.map((artifact) => (
                      <div key={artifact.fileId} className={styles.linkItem}>
                        <span className={styles.fileName}>{artifact.name}</span>
                        <a href={artifact.url} download={artifact.name} className={styles.linkAnchor}>下载</a>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.actionRow}>
                  <button type="button" onClick={t.resetLocalState} className={styles.button.secondary}>再次传输</button>
                </div>
              </div>
            )}

            {isTerminal && t.phase !== "completed" && (
              <div className={styles.innerPanel}>
                <p className={styles.panelTitle}>
                  {t.phase === "cancelled" ? "传输已取消" : "传输失败"}
                </p>
                <p className={styles.panelHint}>{t.errorMessage || t.statusMessage}</p>
                <div className={styles.actionRow}>
                  <button type="button" onClick={t.resetLocalState} className={styles.button.secondary}>重新开始</button>
                </div>
              </div>
            )}

            {["waiting-peer", "joining-room", "negotiating", "ready", "transferring"].includes(t.phase) && (
              <div className="flex justify-end">
                <button type="button" onClick={t.cancelCurrentSession} className={styles.button.danger}>取消传输</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
