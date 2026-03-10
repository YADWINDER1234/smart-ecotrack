import { useEffect, useRef } from "react";

// simple wrapper around html5-qrcode
export function QRScanner({
  onScan
}: {
  onScan: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function start() {
      if (!containerRef.current) return;
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!isMounted) return;
      const qrCode = new Html5Qrcode(containerRef.current.id);
      html5QrCodeRef.current = qrCode;
      const config = { fps: 10, qrbox: 250 };
      try {
        await qrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            // callback on success
            onScan(decodedText);
          },
          () => {
            // scan failure, ignore
          }
        );
      } catch (err) {
        console.error("QR scanner error", err);
      }
    }
    start();
    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return <div ref={containerRef} id="qr-reader" style={{ width: "100%" }} />;
}
