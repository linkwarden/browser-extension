import { FC } from 'react';

interface WholeContainerProps {
  children: React.ReactNode;
}

const WholeContainer: FC<WholeContainerProps> = ({ children }) => {
  return (
    <div className='inset-0 w-full flex justify-center h-full'>
      {children}
    </div>
  );
};

export default WholeContainer;