import { Button } from '../../@/components/ui/Button.tsx';
import Container from '../../@/components/Container.tsx';
import WholeContainer from '../../@/components/WholeContainer.tsx';
import BookmarkForm from '../../@/components/BookmarkForm.tsx';
import { openOptions } from '../../@/lib/utils.ts';
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
        <div className="flex justify-between w-full items-center">
          <h1 className="text-lg">Add Bookmark</h1>
          <Button
            variant="link"
            className="text-blue-500"
            onClick={openOptions}
          >
            Config
          </Button>
        </div>
        <BookmarkForm />
        <Modal open={!isAllConfigured} />
      </Container>
    </WholeContainer>
  );
}

export default App;
