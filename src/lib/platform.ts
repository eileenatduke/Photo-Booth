export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const isWeb = !isTauri;

export async function saveImage(
  dataUrl: string,
  suggestedName: string,
): Promise<{ saved: boolean }> {
  if (isTauri) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { invoke } = await import("@tauri-apps/api/core");
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "PNG image", extensions: ["png"] }],
    });
    if (!path) return { saved: false };
    await invoke("save_png_to_path", { path, dataUrl });
    return { saved: true };
  }

  // Browser fallback — anchor with download attribute.
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return { saved: true };
}

export type EmailMethod = "tauri-mail" | "web-share" | "mailto";

export async function emailImage(opts: {
  dataUrl: string;
  subject: string;
  body: string;
  to?: string;
  suggestedName?: string;
}): Promise<{ method: EmailMethod }> {
  const filename = opts.suggestedName ?? "photo-booth.png";

  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("email_image", {
      dataUrl: opts.dataUrl,
      subject: opts.subject,
      body: opts.body,
      to: opts.to || null,
    });
    return { method: "tauri-mail" };
  }

  // Try the Web Share API with a file (works on iOS Safari, modern Chrome).
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData & { files?: File[] }) => boolean;
    share?: (data: ShareData & { files?: File[] }) => Promise<void>;
  };
  if (nav.share && nav.canShare) {
    try {
      const file = await dataUrlToFile(opts.dataUrl, filename);
      const shareData = {
        files: [file],
        title: opts.subject,
        text: opts.body,
      };
      if (nav.canShare(shareData)) {
        await nav.share(shareData);
        return { method: "web-share" };
      }
    } catch {
      // user dismissed, or share unsupported for files — fall through
    }
  }

  // Last resort: trigger a download, then open the user's mail client
  // with subject/body prefilled. mailto: can't carry attachments per
  // RFC, so we ask them to attach the file that just downloaded.
  await saveImage(opts.dataUrl, filename);
  const params = new URLSearchParams({
    subject: opts.subject,
    body:
      opts.body +
      "\n\n(Attach the file that just downloaded — your browser won't let me attach automatically.)",
  });
  const mail = `mailto:${encodeURIComponent(opts.to || "")}?${params.toString()}`;
  window.location.href = mail;
  return { method: "mailto" };
}

async function dataUrlToFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}
