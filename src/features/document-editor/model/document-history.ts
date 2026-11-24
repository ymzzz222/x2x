import type * as Y from "yjs";
import type { DocumentPosition, DocumentSelection } from "./document-model";

export type FoldChange = { ids: readonly string[]; folded: boolean };
export type DocumentLocation = {
  position: DocumentPosition;
  editing: boolean;
  selection?: DocumentSelection;
  restoreActiveSelection?: boolean;
  foldChange?: FoldChange;
};

type ViewStep = { sequence: number; before: DocumentLocation; after: DocumentLocation };
type StackItem = NonNullable<ReturnType<Y.UndoManager["undo"]>>;

export class DocumentHistory {
  private sequence = 0;
  private undoView: ViewStep[] = [];
  private redoView: ViewStep[] = [];
  private location?: DocumentLocation;
  private pendingCaret?: Map<unknown, unknown>;
  private groupedEdit?: { key: string; entry: StackItem; time: number };

  constructor(private readonly manager: Y.UndoManager, typingOrigin: unknown) {
    manager.on("stack-item-added", ({ stackItem, origin }) => {
      if (origin === manager) return;
      this.redoView.length = 0;
      stackItem.meta.set("sequence", ++this.sequence);
      stackItem.meta.set("before", this.location);
      stackItem.meta.set("after", this.location);
      if (origin === typingOrigin) this.pendingCaret = stackItem.meta;
    });
    manager.on("stack-item-updated", ({ stackItem, origin }) => {
      if (origin === typingOrigin) this.pendingCaret = stackItem.meta;
    });
  }

  setLocation(location: DocumentLocation) {
    this.location = location;
    this.pendingCaret?.set("after", location);
    this.pendingCaret = undefined;
  }

  endTyping() {
    this.manager.stopCapturing();
    this.pendingCaret = undefined;
    this.groupedEdit = undefined;
  }

  edit(before: DocumentLocation, after: DocumentLocation, apply: () => void, group?: string) {
    const previous = this.manager.undoStack.at(-1);
    const open = this.groupedEdit;
    const join = Boolean(group && open && open.key === group && open.entry === previous &&
      Date.now() - open.time < this.manager.captureTimeout);
    if (!join) this.endTyping();
    this.setLocation(before);
    apply();
    const entry = this.manager.undoStack.at(-1);
    if (entry && (entry !== previous || join)) {
      if (entry !== previous) entry.meta.set("before", before);
      entry.meta.set("after", after);
      if (group) this.groupedEdit = { key: group, entry, time: Date.now() };
    }
    if (!group) this.endTyping();
  }

  fold(id: string, folded: boolean) {
    this.endTyping();
    this.manager.clear(false, true);
    this.redoView.length = 0;
    const location = { position: { blockId: id, offset: 0 }, editing: false };
    this.undoView.push({
      sequence: ++this.sequence,
      before: { ...location, foldChange: { ids: [id], folded: !folded } },
      after: { ...location, foldChange: { ids: [id], folded } },
    });
  }

  undo(redo: boolean) {
    this.endTyping();
    const manager = this.manager;
    const content = redo ? manager.redoStack : manager.undoStack;
    const views = redo ? this.redoView : this.undoView;
    const view = views.at(-1);
    let boundary = 0;
    if (view) {
      boundary = content.length;
      while (boundary > 0) {
        const sequence = content[boundary - 1].meta.get("sequence") as number;
        if (redo ? sequence >= view.sequence : sequence <= view.sequence) break;
        boundary--;
      }
    }

    // Yjs can skip an invalidated content entry. Stop at the next local fold in chronological order.
    const deferred = boundary ? content.splice(0, boundary) : [];
    let entry: StackItem | null;
    try {
      entry = redo ? manager.redo() : manager.undo();
    } finally {
      for (let i = deferred.length - 1; i >= 0; i--) content.unshift(deferred[i]);
    }
    if (entry) {
      const inverse = (redo ? manager.undoStack : manager.redoStack).at(-1);
      for (const [key, value] of entry.meta) inverse?.meta.set(key, value);
      return entry.meta.get(redo ? "after" : "before") as DocumentLocation | undefined;
    }
    if (view) {
      views.pop();
      (redo ? this.undoView : this.redoView).push(view);
      return redo ? view.after : view.before;
    }
  }

  destroy() {
    this.manager.destroy();
  }
}
