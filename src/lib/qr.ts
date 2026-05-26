import QRCode from "qrcode";

export async function toQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    color: { dark: "#2A2620", light: "#FAF7F2" },
  });
}
