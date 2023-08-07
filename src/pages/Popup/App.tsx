import { Button } from '../../@/components/ui/Button.tsx';
import Container from '../../@/components/Container.tsx';
import WholeContainer from '../../@/components/WholeContainer.tsx';
import { Separator } from '../../@/components/ui/Separator.tsx';
import BookmarkForm from '../../@/components/BookmarkForm.tsx';

function App() {
  return (
    <WholeContainer>
      <Container>
        <div className='flex justify-between w-full p-4 items-center'>
          <h1 className='text-lg'>Add a bookmark</h1>
          <Button variant='link' className='text-blue-500'>Options</Button>
        </div>
        <Separator />
        <BookmarkForm />
      </Container>
    </WholeContainer>
  );
}

export default App;
