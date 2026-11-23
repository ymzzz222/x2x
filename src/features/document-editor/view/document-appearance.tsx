import { useEffect, useEffectEvent, useState } from "react";
import type { SampleSize } from "../model/document-model";
import styles from "./document-appearance.module.css";

const covers = ["无封面", "雾蓝", "苔绿", "暖橙", "暮紫"] as const;
const icons = ["", "📄", "📘", "📝", "📚", "⭐", "🌱"] as const;
type Appearance = { title: string; icon: string; cover: number; showInfo: boolean };
const initial: Appearance = { title: "长文档原型", icon: "", cover: 0, showInfo: true };

export function useDocumentAppearance(size?: SampleSize) {
  const key = size && "x2x:document-appearance:" + size;
  const [appearance, setAppearance] = useState<Appearance>(() => size ? initial : { ...initial, title: "" });
  const load = useEffectEvent(() => {
    if (!key) return;
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<Appearance> | null;
      if (!value) return;
      setAppearance({
        title: typeof value.title === "string" ? value.title.slice(0, 120) : initial.title,
        icon: typeof value.icon === "string" && icons.some((icon) => icon === value.icon) ? value.icon : initial.icon,
        cover: Number.isInteger(value.cover) && value.cover! >= 0 && value.cover! < covers.length ? value.cover! : initial.cover,
        showInfo: typeof value.showInfo === "boolean" ? value.showInfo : initial.showInfo,
      });
    } catch {
      // Appearance is optional when browser storage is unavailable.
    }
  });
  useEffect(() => {
    if (!key) return;
    const frame = requestAnimationFrame(() => load());
    function onStorage(event: StorageEvent) { if (event.key === key) load(); }
    window.addEventListener("storage", onStorage);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  function update(values: Partial<Appearance>) {
    const next = { ...appearance, ...values };
    setAppearance(next);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { /* The current view still reflects the change. */ }
  }
  return { appearance, update };
}

export function DocumentAppearanceControls({ settings }: { settings: ReturnType<typeof useDocumentAppearance> }) {
  const { appearance, update } = settings;
  return (
    <details className={styles.controls}>
      <summary>文档外观</summary>
      <div className={styles.fields}>
        <label>文档标题
          <input type="text" maxLength={120} value={appearance.title} placeholder="无标题文档"
            onChange={(event) => update({ title: event.currentTarget.value })} />
        </label>
        <label>标题图标
          <select value={appearance.icon} onChange={(event) => update({ icon: event.currentTarget.value })}>
            {icons.map((icon) => <option key={icon} value={icon}>{icon || "无图标"}</option>)}
          </select>
        </label>
        <label>封面
          <select value={appearance.cover} onChange={(event) => update({ cover: Number(event.currentTarget.value) })}>
            {covers.map((cover, index) => <option key={cover} value={index}>{cover}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={appearance.showInfo}
          onChange={(event) => update({ showInfo: event.currentTarget.checked })} />显示文档信息</label>
      </div>
    </details>
  );
}

export function DocumentAppearanceTitle({ value }: { value: Appearance }) {
  return <h1 className={styles.title}>{value.icon && <span aria-hidden="true">{value.icon} </span>}{value.title.trim() || "无标题文档"}</h1>;
}

export function DocumentCover({ value }: { value: Appearance }) {
  return value.cover > 0 ? <div className={styles.cover} data-cover={value.cover} aria-hidden="true" /> : null;
}
