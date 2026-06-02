import type { ManifestFileItem, TransferManifest, TransferProgress } from "@/lib/transfer-types";
import {
  CHUNK_SIZE,
  EMPTY_PROGRESS,
  decodeDataFrame,
  encodeDataFrame,
  type CurrentFileSink,
} from "./transfer-utils";
import type { TransferActions, TransferRefs } from "./types";

export function createProgressManager(refs: TransferRefs, setProgress: (p: TransferProgress) => void) {
  function resetProgress(nextManifest: TransferManifest | null = null) {
    const next = {
      ...EMPTY_PROGRESS,
      totalBytes: nextManifest?.totalBytes ?? 0,
      totalFiles: nextManifest?.files.length ?? 0,
    } satisfies TransferProgress;
    refs.progress.current = next;
    refs.progressSamples.current = [];
    setProgress(next);
  }

  function updateProgress(patch: Partial<TransferProgress>) {
    const currentTime = Date.now();
    const merged = { ...refs.progress.current, ...patch };

    refs.progressSamples.current.push({ bytes: merged.transferredBytes, at: currentTime });
    refs.progressSamples.current = refs.progressSamples.current.filter(
      (s) => currentTime - s.at <= 4_000,
    );

    const first = refs.progressSamples.current[0];
    const last = refs.progressSamples.current.at(-1);
    const speed =
      first && last && last.at > first.at
        ? ((last.bytes - first.bytes) / (last.at - first.at)) * 1000
        : 0;
    const remaining = Math.max(merged.totalBytes - merged.transferredBytes, 0);

    const next = {
      ...merged,
      speedBytesPerSecond: speed,
      etaSeconds: speed > 0 && remaining > 0 ? remaining / speed : null,
    } satisfies TransferProgress;

    refs.progress.current = next;
    setProgress(next);
  }

  return { resetProgress, updateProgress };
}

export function createFileTransfer(
  refs: TransferRefs,
  actions: TransferActions,
  signaling: { post: <T>(payload: Record<string, unknown>) => Promise<T>; sendControlMessage: (msg: import("@/lib/transfer-types").ControlMessage) => void; waitForBufferedAmount: () => Promise<void> },
) {
  function revokeObjectUrls() {
    for (const url of refs.objectUrls.current) URL.revokeObjectURL(url);
    refs.objectUrls.current.clear();
  }

  async function finalizeCurrentSink() {
    const sink = refs.currentSink.current;
    refs.currentSink.current = null;
    if (!sink) return;

    if (sink.writable) {
      await sink.writable.close();
      return;
    }

    const blob = new Blob(sink.chunks, { type: sink.file.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    refs.objectUrls.current.add(url);
    actions.setDownloadArtifacts((prev) => {
      const next = prev.filter((a) => a.fileId !== sink.file.id);
      next.push({ fileId: sink.file.id, name: sink.file.name, url });
      return next;
    });
  }

  async function createSinkForFile(file: ManifestFileItem): Promise<CurrentFileSink> {
    const dir = refs.directoryHandle.current;
    if (!dir) return { file, writable: null, chunks: [] };
    const fh = await dir.getFileHandle(file.name, { create: true });
    const writable = await fh.createWritable();
    return { file, writable, chunks: [] };
  }

  async function handleIncomingFrame(buffer: ArrayBuffer) {
    const nextManifest = refs.manifest.current;
    if (!nextManifest) throw new Error("还没有收到文件清单。");

    const frame = decodeDataFrame(buffer);
    const manifestFile = nextManifest.files[frame.fileIndex];
    if (!manifestFile) throw new Error("收到未知文件索引。");

    if (frame.type === 1) {
      await finalizeCurrentSink();
      refs.currentSink.current = await createSinkForFile(manifestFile);
      actions.updateProgress({
        currentFileId: manifestFile.id,
        currentFileName: manifestFile.name,
        currentFileBytes: manifestFile.size,
        currentFileTransferredBytes: 0,
      });
      return;
    }

    if (frame.type === 2) {
      const sink = refs.currentSink.current;
      if (!sink) throw new Error("文件写入器尚未准备好。");
      if (sink.writable) await sink.writable.write(frame.payload);
      else sink.chunks.push(frame.payload);
      actions.updateProgress({
        transferredBytes: refs.progress.current.transferredBytes + frame.payload.byteLength,
        currentFileId: manifestFile.id,
        currentFileName: manifestFile.name,
        currentFileBytes: manifestFile.size,
        currentFileTransferredBytes: refs.progress.current.currentFileTransferredBytes + frame.payload.byteLength,
      });
      return;
    }

    await finalizeCurrentSink();
    actions.updateProgress({
      currentFileId: manifestFile.id,
      currentFileName: manifestFile.name,
      currentFileBytes: manifestFile.size,
      currentFileTransferredBytes: manifestFile.size,
      completedFiles: Math.min(refs.progress.current.completedFiles + 1, nextManifest.files.length),
    });
  }

  async function startTransfer() {
    if (refs.sending.current) return;
    const files = refs.selectedFiles.current;
    const nextManifest = refs.manifest.current;
    const channel = refs.dataChannel.current;
    if (!files.length || !nextManifest || !channel) throw new Error("传输通道尚未就绪。");

    refs.sending.current = true;
    actions.setPhase("transferring");
    actions.setStatusMessage("正在按顺序发送文件。请保持双方页面在线。");

    try {
      let transferredBytes = 0;
      let completedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mf = nextManifest.files[i];
        channel.send(encodeDataFrame(1, i));

        let offset = 0;
        while (offset < file.size) {
          await signaling.waitForBufferedAmount();
          const chunk = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
          channel.send(encodeDataFrame(2, i, chunk));
          offset += chunk.byteLength;
          transferredBytes += chunk.byteLength;
          actions.updateProgress({
            transferredBytes,
            currentFileId: mf.id,
            currentFileName: mf.name,
            currentFileBytes: mf.size,
            currentFileTransferredBytes: offset,
            completedFiles,
          });
        }

        channel.send(encodeDataFrame(3, i));
        completedFiles += 1;
        actions.updateProgress({
          transferredBytes,
          currentFileId: mf.id,
          currentFileName: mf.name,
          currentFileBytes: mf.size,
          currentFileTransferredBytes: mf.size,
          completedFiles,
        });
      }

      signaling.sendControlMessage({ type: "transfer-complete" });
      await signaling.post<{ ok: true }>({
        action: "complete",
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
      });
      actions.setPhase("completed");
      actions.setStatusMessage("文件已全部发送完成。");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "文件发送失败。";
      try { signaling.sendControlMessage({ type: "transfer-error", message: msg }); } catch { /* ignore */ }
      await actions.failSession(msg, "failed");
    } finally {
      refs.sending.current = false;
    }
  }

  return { revokeObjectUrls, handleIncomingFrame, startTransfer };
}

export function createTextTransfer(
  refs: TransferRefs,
  actions: TransferActions,
  signaling: { post: <T>(payload: Record<string, unknown>) => Promise<T>; sendControlMessage: (msg: import("@/lib/transfer-types").ControlMessage) => void; waitForBufferedAmount: () => Promise<void> },
  onTextReceived: (text: string) => void,
) {
  let currentChunks: ArrayBuffer[] = [];
  let currentFile: ManifestFileItem | null = null;

  async function handleIncomingTextFrame(buffer: ArrayBuffer) {
    const nextManifest = refs.manifest.current;
    if (!nextManifest) throw new Error("还没有收到文件清单。");

    const frame = decodeDataFrame(buffer);
    const manifestFile = nextManifest.files[frame.fileIndex];
    if (!manifestFile) throw new Error("收到未知文件索引。");

    if (frame.type === 1) {
      currentChunks = [];
      currentFile = manifestFile;
      actions.updateProgress({
        currentFileId: manifestFile.id,
        currentFileName: manifestFile.name,
        currentFileBytes: manifestFile.size,
        currentFileTransferredBytes: 0,
      });
      return;
    }

    if (frame.type === 2) {
      currentChunks.push(frame.payload);
      const transferred = currentChunks.reduce((s, c) => s + c.byteLength, 0);
      actions.updateProgress({
        transferredBytes: refs.progress.current.transferredBytes + frame.payload.byteLength,
        currentFileId: manifestFile.id,
        currentFileName: manifestFile.name,
        currentFileBytes: manifestFile.size,
        currentFileTransferredBytes: transferred,
      });
      return;
    }

    // type 3: file complete
    const all = new Uint8Array(currentChunks.reduce((s, c) => s + c.byteLength, 0));
    let offset = 0;
    for (const chunk of currentChunks) {
      all.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder().decode(all);
    currentChunks = [];

    actions.updateProgress({
      currentFileId: manifestFile.id,
      currentFileName: manifestFile.name,
      currentFileBytes: manifestFile.size,
      currentFileTransferredBytes: manifestFile.size,
      completedFiles: Math.min(refs.progress.current.completedFiles + 1, nextManifest.files.length),
    });

    onTextReceived(text);
  }

  async function startTransfer(text: string) {
    if (refs.sending.current) return;
    const nextManifest = refs.manifest.current;
    const channel = refs.dataChannel.current;
    if (!nextManifest || !channel) throw new Error("传输通道尚未就绪。");

    refs.sending.current = true;
    actions.setPhase("transferring");
    actions.setStatusMessage("正在发送文本。请保持双方页面在线。");

    try {
      const encoded = new TextEncoder().encode(text);
      const buffer = encoded.buffer;

      channel.send(encodeDataFrame(1, 0));

      let offset = 0;
      while (offset < buffer.byteLength) {
        await signaling.waitForBufferedAmount();
        const end = Math.min(offset + CHUNK_SIZE, buffer.byteLength);
        const chunk = buffer.slice(offset, end);
        channel.send(encodeDataFrame(2, 0, chunk));
        offset = end;
        actions.updateProgress({
          transferredBytes: offset,
          currentFileId: nextManifest.files[0]?.id ?? null,
          currentFileName: nextManifest.files[0]?.name ?? null,
          currentFileBytes: buffer.byteLength,
          currentFileTransferredBytes: offset,
          completedFiles: 0,
        });
      }

      channel.send(encodeDataFrame(3, 0));

      signaling.sendControlMessage({ type: "transfer-complete" });
      await signaling.post<{ ok: true }>({
        action: "complete",
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
      });
      actions.setPhase("completed");
      actions.setStatusMessage("文本已发送完成。");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "文本发送失败。";
      try { signaling.sendControlMessage({ type: "transfer-error", message: msg }); } catch { /* ignore */ }
      await actions.failSession(msg, "failed");
    } finally {
      refs.sending.current = false;
    }
  }

  return { handleIncomingTextFrame, startTransfer };
}
