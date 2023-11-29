import { Button } from '../../@/components/ui/Button.tsx';
import Container from '../../@/components/Container.tsx';
import WholeContainer from '../../@/components/WholeContainer.tsx';
import BookmarkForm from '../../@/components/BookmarkForm.tsx';
import { openOptions } from '../../@/lib/utils.ts';
import { useEffect, useState } from 'react';
import { getConfig, isConfigured } from '../../@/lib/config.ts';
import Modal from '../../@/components/Modal.tsx';

function App() {
  const [isAllConfigured, setIsAllConfigured] = useState<boolean>();
  const [baseUrl, setBaseUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const cachedOptions = await isConfigured();
      const cachedConfig = await getConfig();
      setBaseUrl(cachedConfig.baseUrl);
      setIsAllConfigured(cachedOptions);
    })();
  }, []);

  return (
    <WholeContainer>
      <Container>
        <div className="flex justify-between w-full items-center">
          <div className="flex space-x-2 w-full items-center">
            <a href={baseUrl} rel="noopener" target="_blank" referrerPolicy="no-referrer" className="hover:opacity-50 duration-100 ease-in-out"><img src="./128.png" height="36px" width="36px" alt="Linkwarden Logo"/></a>
            <h1 className="text-lg">Add Link</h1>
          </div>
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
