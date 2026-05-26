import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "../state/session";
import { StepHeader } from "./StepHeader";
import { isTauri, saveImage, emailImage } from "../lib/platform";

const DEFAULT_SUBJECT = "A photograph from the Photo Booth";
const DEFAULT_BODY =
  "Attached is a photo from a recent sitting at the Photo Booth.\n\nWith fondest regards,";

export function OutputScreen() {
  const { filteredDataUrl, reset } = useSession(
    useShallow((s) => ({
      filteredDataUrl: s.filteredDataUrl,
      reset: s.reset,
    })),
  );

  const [status, setStatus] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [sending, setSending] = useState(false);

  async function handleDownload() {
    if (!filteredDataUrl) return;
    setDownloadError(null);
    try {
      const { saved } = await saveImage(
        filteredDataUrl,
        `photo-booth-${Date.now()}.png`,
      );
      if (saved) {
        setStatus("Saved ✓");
        setTimeout(() => setStatus(null), 2400);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDownloadError(msg || "Save failed.");
    }
  }

  async function handleEmail() {
    if (!filteredDataUrl) return;
    setEmailError(null);
    setSending(true);
    try {
      const { method } = await emailImage({
        dataUrl: filteredDataUrl,
        subject: subject || DEFAULT_SUBJECT,
        body: DEFAULT_BODY,
        to: recipient,
        suggestedName: `photo-booth-${Date.now()}.png`,
      });
      const msg =
        method === "tauri-mail"
          ? "Mail draft opened ✓"
          : method === "web-share"
            ? "Share sheet opened ✓"
            : "Photo downloaded — attach it in your mail draft ✓";
      setStatus(msg);
      setTimeout(() => setStatus(null), 3600);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setEmailError(msg || "Couldn't open Mail.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <StepHeader
        title="The print is ready"
        subtitle="Save it as a file, or post it by mail to whomever you fancy."
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
        <aside className="w-96 flex flex-col gap-4">
          <div className="card-bordered p-5">
            <p className="smallcaps mb-3">By Post</p>
            <label className="block">
              <span className="font-body italic text-sm text-ink-soft">
                To whom — their address
              </span>
              <input
                type="email"
                placeholder="friend@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md bg-cream border border-hairline focus:border-burnt focus:outline-none font-mono text-sm"
              />
            </label>
            <label className="block mt-3">
              <span className="font-body italic text-sm text-ink-soft">
                Subject
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-md bg-cream border border-hairline focus:border-burnt focus:outline-none font-body italic text-base"
              />
            </label>
            <button
              className="btn-primary w-full mt-4"
              onClick={handleEmail}
              disabled={!filteredDataUrl || sending}
            >
              {sending
                ? "Opening Mail…"
                : isTauri
                  ? "Compose in Mail"
                  : "Send by mail"}
            </button>
            {emailError && (
              <p className="text-xs text-burnt mt-2 italic">{emailError}</p>
            )}
            <p className="text-xs text-muted italic mt-3 leading-snug">
              {isTauri
                ? "Opens Mail.app with the photograph attached."
                : "On phones and some browsers, your share sheet opens with the photo attached. Otherwise the photo downloads first — attach it in your mail draft."}
            </p>
          </div>

          <button className="btn-secondary" onClick={handleDownload}>
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
          <button className="btn-ghost mt-auto" onClick={reset}>
            Begin a new sitting
          </button>
        </aside>
      </div>
    </div>
  );
}
