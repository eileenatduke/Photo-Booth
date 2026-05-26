import QRCode from "qrcode";

export async function toQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    color: { dark: "#2A1F12", light: "#F5EEDC" },
  });
}
