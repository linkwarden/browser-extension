import { FC } from 'react';

interface WholeContainerProps {
  children: React.ReactNode;
}

const WholeContainer: FC<WholeContainerProps> = ({ children }) => {
  return (
    <div className="inset-0 w-full flex justify-center max-h-[600px] overflow-y-hidden relative">
      {children}
    </div>
  );
};

export default WholeContainer;
