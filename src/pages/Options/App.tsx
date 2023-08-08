import WholeContainer from '../../@/components/WholeContainer.tsx';
import Container from '../../@/components/Container.tsx';
import { Separator } from '../../@/components/ui/Separator.tsx';
import OptionsForm from '../../@/components/OptionsForm.tsx';

const App = () => {

  return (
    <WholeContainer>
      <Container>
        <div className='justify-center items-center p-2 flex'>
          <h1 className='text-lg'>Options configuration</h1>
        </div>
        <div>
          <Separator />
          <p className='text-base pt-2'>This is a extension for the <a
            href='https://github.com/linkwarden/linkwarden'
            rel='noopener' target='_blank'
            className='text-blue-400 hover:text-blue-500 hover:underline'>linkwarden</a> app,
            to add
            bookmarks. You have to
            configure it with
            your values provided from your installation or web app.</p>
        </div>
        <OptionsForm />
      </Container>
    </WholeContainer>
  );
};

export default App;