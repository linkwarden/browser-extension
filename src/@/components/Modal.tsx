import { FC } from 'react';
import { Separator } from './ui/Separator.tsx';
import { openOptions } from '../lib/utils.ts';
import { Button } from './ui/Button.tsx';

interface ModalProps {
  open: boolean;
}

const Modal: FC<ModalProps> = ({ open }) => {

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-zinc-900/20 z-10'>
      <div className='container flex items-center h-full max-w-lg mx-auto'>
        <div className='relative bg-white w-full h-fit py-20 px-2 rounded-md space-y-4 flex flex-col'>
          <h2 className='text-xl text-zinc-700'>Initial Config</h2>
          <Separator />
          <p className='text-base text-zinc-700'>This extension is supposed to be work with the linkwarden app,
            use it if you already have an installation or you are just a regular use of it</p>
          <div className='flex justify-center items-center'>
            <Button onClick={() => openOptions()} className='max-w-[50%]'>Configure</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;