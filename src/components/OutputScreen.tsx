import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useSession } from "../state/session";
import { toQrDataUrl } from "../lib/qr";
import { StepHeader } from "./StepHeader";

export function OutputScreen() {
  const { filteredDataUrl, qrUrl, setQrUrl, reset } = useSession(
    useShallow((s) => ({
      filteredDataUrl: s.filteredDataUrl,
      qrUrl: s.qrUrl,
      setQrUrl: s.setQrUrl,
      reset: s.reset,
    })),
  );

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!filteredDataUrl || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const url = await invoke<string>("start_qr_server", {
          dataUrl: filteredDataUrl,
        });
        setQrUrl(url);
        const qr = await toQrDataUrl(url);
        setQrDataUrl(qr);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setServerError(msg || "Couldn't start the QR server.");
      }
    })();
    return () => {
      invoke("stop_qr_server").catch(() => {});
    };
  }, [filteredDataUrl, setQrUrl]);

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
      setStatus("Saved ✓");
      setTimeout(() => setStatus(null), 2400);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDownloadError(msg || "Save failed.");
    }
  }

  async function handleCopyUrl() {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setStatus("Link copied ✓");
      setTimeout(() => setStatus(null), 2400);
    } catch {
      // ignore — fallback shown in UI
    }
  }

  function handleNew() {
    invoke("stop_qr_server").catch(() => {});
    reset();
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="The print is ready"
        subtitle="Save it as a file, or scan the cipher to send it to your telephone."
        ornament="✦"
      />
      <div className="px-10 pb-10 flex-1 flex gap-8 items-stretch">
        <div className="flex-1 flex items-center justify-center">
          {filteredDataUrl && (
            <div className="relative bg-paper p-5 shadow-lift rotate-[-0.4deg]">
              <img
                src={filteredDataUrl}
                alt="Final"
                className="max-h-[68vh] max-w-full block fade-in"
              />
              <p className="font-body italic text-center text-ink-soft mt-3">
                — finis —
              </p>
            </div>
          )}
        </div>
        <aside className="w-80 flex flex-col gap-4">
          <div className="card-bordered p-5 text-center">
            <p className="smallcaps mb-3">By Wireless</p>
            <div className="aspect-square w-full bg-paper rounded flex items-center justify-center overflow-hidden border border-hairline">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code" className="w-full h-full" />
              ) : serverError ? (
                <p className="text-xs text-burnt px-4 italic">{serverError}</p>
              ) : (
                <p className="font-body italic text-muted">Preparing cipher…</p>
              )}
            </div>
            {qrUrl && (
              <>
                <button
                  className="text-[11px] text-muted hover:text-ink mt-3 break-all font-mono"
                  onClick={handleCopyUrl}
                  title="Copy link"
                >
                  {qrUrl}
                </button>
                <p className="text-xs text-muted italic mt-2">
                  Same Wi-Fi network as this machine.
                </p>
              </>
            )}
          </div>

          <button className="btn-primary" onClick={handleDownload}>
            Save as PNG
          </button>
          {downloadError && (
            <p className="text-xs text-burnt text-center italic">
              {downloadError}
            </p>
          )}
          {status && (
            <p className="text-xs text-sage-deep text-center italic">
              {status}
            </p>
          )}
          <button className="btn-secondary mt-auto" onClick={handleNew}>
            Begin a new sitting
          </button>
        </aside>
      </div>
    </div>
  );
}
