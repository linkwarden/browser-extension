import { FC } from 'react';
import { openOptions } from '../lib/utils.ts';
import { Button } from './ui/Button.tsx';

interface ModalProps {
  open: boolean;
}

const Modal: FC<ModalProps> = ({ open }) => {
  if (!open) return null;

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 inset-0 bg-white z-10">
      <div className="container flex flex-col gap-3 justify-center items-center h-full max-w-lg mx-auto">
        <h2 className="text-lg text-zinc-700">Initial Config</h2>

        <div className="flex justify-center items-center">
          <Button onClick={() => openOptions()} className="w-40">
            Configure
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
