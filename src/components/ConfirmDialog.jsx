import { useEffect, useRef } from "react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert.jsx";

/** In-page replacement for window.confirm. Escape and the backdrop cancel; focus starts on Cancel so a stray Enter is safe. */
export default function ConfirmDialog({ title, description, confirmLabel = "Confirm", cancelLabel = "Keep it", onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal stack" role="alertdialog" aria-modal="true" aria-labelledby="cd-t" aria-describedby="cd-d">
        <Alert variant="warning">
          <AlertTitle><span id="cd-t">{title}</span></AlertTitle>
          <AlertDescription><span id="cd-d">{description}</span></AlertDescription>
        </Alert>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" ref={cancelRef} className="btn ghost" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
