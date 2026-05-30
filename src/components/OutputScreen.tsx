import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useSession } from "../state/session";
import { Rule } from "./Ornaments";

export function OutputScreen() {
  const { filteredDataUrl, reset } = useSession(
    useShallow((s) => ({
      filteredDataUrl: s.filteredDataUrl,
      reset: s.reset,
    })),
  );

  const [status, setStatus] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    if (!filteredDataUrl) return;
    setDownloadError(null);
    try {
      const path = await save({
        defaultPath: `photo-booth-${Date.now()}.png`,
        filters: [{ name: "PNG image", extensions: ["png"] }],
      });
      if (!path) return;
      await invoke("save_png_to_path", {
        path,
        dataUrl: filteredDataUrl,
      });
      setStatus("Downloaded ✓");
      setTimeout(() => setStatus(null), 2400);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDownloadError(msg || "Download failed.");
    }
  }

  function handleNew() {
    reset();
  }

  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="text-center pt-8 pb-2">
        <p className="smallcaps mb-3">Your Portraits Are Ready</p>
        <h2 className="heading-display text-4xl sm:text-5xl">The Final Print</h2>
        <Rule className="mt-5" />
      </div>

      <div className="flex-1 px-2 pb-10 flex flex-col items-center justify-center gap-8">
        {filteredDataUrl && (
          <img
            src={filteredDataUrl}
            alt="Final"
            className="max-h-[62vh] w-auto block rounded-[3px] shadow-lift fade-in"
          />
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              onClick={handleDownload}
              disabled={!filteredDataUrl}
            >
              Download
            </button>
            <button className="btn-secondary" onClick={handleNew}>
              New Sitting
            </button>
          </div>
          {downloadError && (
            <p className="text-xs text-ink/70 italic">{downloadError}</p>
          )}
          {status && (
            <p className="text-xs text-champagne-deep italic">{status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
