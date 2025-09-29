import Container from '../../@/components/Container.tsx';
import WholeContainer from '../../@/components/WholeContainer.tsx';
import BookmarkForm from '../../@/components/BookmarkForm.tsx';
import { useEffect, useState } from 'react';
import { isConfigured } from '../../@/lib/config.ts';
import Modal from '../../@/components/Modal.tsx';

function App() {
  const [isAllConfigured, setIsAllConfigured] = useState<boolean>();

  useEffect(() => {
    (async () => {
      const cachedOptions = await isConfigured();
      setIsAllConfigured(cachedOptions);
    })();
  }, []);

  return (
    <WholeContainer>
      <Container>
        <BookmarkForm />
        <Modal open={!isAllConfigured} />
      </Container>
    </WholeContainer>
  );
}

export default App;
