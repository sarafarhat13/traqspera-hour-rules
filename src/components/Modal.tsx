import { useEffect, useRef } from 'react';
import { ModusWcModal } from '@trimble-oss/moduswebcomponents-react';

interface ModalProps {
  modalId: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 'static' prevents closing by clicking the backdrop (used for the freeze). */
  backdrop?: 'default' | 'static';
  showClose?: boolean;
}

/**
 * Controlled wrapper around <modus-wc-modal>. The Modus modal renders a native
 * <dialog>; we drive it imperatively via showModal()/close() and mirror its
 * native `close` event back into React state.
 */
export default function Modal({
  modalId,
  isOpen,
  title,
  onClose,
  children,
  footer,
  backdrop = 'default',
  showClose = true,
}: ModalProps) {
  const hostRef = useRef<HTMLModusWcModalElement>(null);

  const getDialog = (): HTMLDialogElement | null => {
    const byId = document.getElementById(modalId) as HTMLDialogElement | null;
    if (byId) return byId;
    return hostRef.current?.querySelector('dialog') ?? null;
  };

  useEffect(() => {
    const dialog = getDialog();
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const dialog = getDialog();
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModusWcModal
      ref={hostRef}
      modalId={modalId}
      aria-label={title}
      backdrop={backdrop}
      showClose={showClose}
      position="center">
      <span slot="header" className="modal-title">
        {title}
      </span>
      <div slot="content">{children}</div>
      {footer && <div slot="footer" className="modal-footer">{footer}</div>}
    </ModusWcModal>
  );
}
