import { WarningCircle } from '@phosphor-icons/react';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation dialog — replaces window.confirm for destructive actions.
 * Focus lands on Cancel (the safe choice), not Confirm.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) {
  const isDanger = tone === 'danger';
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className={isDanger ? '!bg-red-600 !text-white !border-red-600 hover:!bg-red-700' : ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDanger ? 'bg-red-100 text-red-600' : 'bg-trust-100 text-trust-700'
          }`}
        >
          <WarningCircle aria-hidden="true" weight="fill" size={22} />
        </span>
        <p className="pt-1.5 text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}
