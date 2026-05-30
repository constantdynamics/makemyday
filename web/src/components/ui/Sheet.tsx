import { useEffect, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Mobile-first bottom sheet that doubles as a modal. */
export function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grab" />
        <div className="sheet__head">
          {title && <h3>{title}</h3>}
          <button className="sheet__close" onClick={onClose} aria-label="close">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
