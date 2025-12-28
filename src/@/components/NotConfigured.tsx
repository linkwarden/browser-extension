import { FC } from 'react';
import { openOptions } from '../lib/utils.ts';
import { Button } from './ui/Button.tsx';

const NotConfigured: FC = () => {
  return (
    <div className="flex flex-col w-[350px] h-full overflow-y-hidden items-center gap-10 py-10">
      <div className="flex flex-row gap-4">
        <img
          src="./128.png"
          height="40px"
          width="40px"
          className="rounded"
          alt="Linkwarden Logo"
        />
        <h1 className="font-medium" style={{ fontSize: '1.65rem' }}>
          Initial Setup
        </h1>
      </div>
      <Button onClick={() => openOptions()} className="w-37.5">
        Configure
      </Button>
    </div>
  );
};

export default NotConfigured;
