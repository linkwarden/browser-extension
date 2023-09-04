import { FC } from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

const Container: FC<ContainerProps> = ({ children }) => {
  return (
    <div className='flex flex-col w-[386px] px-6 pb-3'>
      {children}
    </div>
  );
};

export default Container;