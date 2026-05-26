import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useSession } from "../state/session";
import { toQrDataUrl } from "../lib/qr";
import { StepHeader } from "./StepHeader";

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = dataUrl.slice(comma + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function OutputScreen() {
  const { filteredDataUrl, qrUrl, setQrUrl, reset } = useSession((s) => ({
    filteredDataUrl: s.filteredDataUrl,
    qrUrl: s.qrUrl,
    setQrUrl: s.setQrUrl,
    reset: s.reset,
  }));

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!filteredDataUrl || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const bytes = dataUrlToBytes(filteredDataUrl);
        const url = await invoke<string>("start_qr_server", {
          imageBytes: Array.from(bytes),
        });
        setQrUrl(url);
        const qr = await toQrDataUrl(url);
        setQrDataUrl(qr);
      } catch (e) {
        setServerError(
          e instanceof Error ? e.message : "Couldn't start the QR server.",
        );
      }
    })();
    return () => {
      invoke("stop_qr_server").catch(() => {});
    };
  }, [filteredDataUrl, setQrUrl]);

  async function handleDownload() {
    if (!filteredDataUrl) return;
    try {
      const path = await save({
        defaultPath: `photo-booth-${Date.now()}.png`,
        filters: [{ name: "PNG image", extensions: ["png"] }],
      });
      if (!path) return;
      const bytes = dataUrlToBytes(filteredDataUrl);
      await writeFile(path, bytes);
      setStatus("Saved!");
      setTimeout(() => setStatus(null), 2000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed.");
    }
  }

  function handleNew() {
    invoke("stop_qr_server").catch(() => {});
    reset();
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="Your photo is ready"
        subtitle="Save it, or scan the code to grab it on your phone."
      />
      <div className="px-10 pb-10 flex-1 flex gap-8 items-stretch">
        <div className="flex-1 flex items-center justify-center">
          {filteredDataUrl && (
            <img
              src={filteredDataUrl}
              alt="Final"
              className="max-h-[70vh] max-w-full rounded-lg shadow-lift fade-in"
            />
          )}
        </div>
        <aside className="w-80 flex flex-col gap-4">
          <div className="card p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">
              Send to your phone
            </p>
            <div className="aspect-square w-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code" className="w-full h-full" />
              ) : serverError ? (
                <p className="text-xs text-accent px-4">{serverError}</p>
              ) : (
                <p className="text-xs text-muted">Starting server…</p>
              )}
            </div>
            {qrUrl && (
              <p className="text-xs text-muted mt-3 break-all">{qrUrl}</p>
            )}
            <p className="text-xs text-muted mt-3">
              Phone must be on the same Wi-Fi network.
            </p>
          </div>

          <button className="btn-primary" onClick={handleDownload}>
            Download PNG
          </button>
          {status && (
            <p className="text-xs text-muted text-center">{status}</p>
          )}
          <button className="btn-secondary mt-auto" onClick={handleNew}>
            Start new session
          </button>
        </aside>
      </div>
    </div>
  );
}
