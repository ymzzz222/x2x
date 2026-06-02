interface DirectoryPickerOptions {
  mode?: "read" | "readwrite";
  id?: string;
  startIn?: FileSystemHandle | WellKnownDirectory;
}

type WellKnownDirectory =
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos";

interface Window {
  showDirectoryPicker?: (
    options?: DirectoryPickerOptions,
  ) => Promise<FileSystemDirectoryHandle>;
}
