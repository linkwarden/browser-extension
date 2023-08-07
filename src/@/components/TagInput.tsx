import { FC, useState } from 'react';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';

interface TagInputProps {
  onChange: (tags: string[]) => void,
  value: string[]
}

export const TagInput: FC<TagInputProps> = ({ onChange, value }) => {
  const [tags, setTags] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState('');

  function handleAddTag() {
    if (inputValue && tags.includes(inputValue)) return;
    if (inputValue) {
      const newTags = [...tags, inputValue];
      setTags(newTags);
      setInputValue('');
      onChange(newTags);
    }
  }

  function handleRemoveTag(tag: string) {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onChange(newTags);
  }

  return (
    <div>
      <div className='flex space-x-2'>
        <Input value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <Button type='button' onClick={handleAddTag} onKeyDown={handleAddTag}>Add</Button>
      </div>
      <div className='flex flex-wrap mt-2'>
        {tags.map(tag => (
          <span
            key={tag}
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2'
          >
            {tag}
            <button
              type='button'
              className='flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white'
              onClick={() => handleRemoveTag(tag)}
            >
              <span className='sr-only'>Remove tag</span>
              <svg className='h-2 w-2' stroke='currentColor' fill='none' viewBox='0 0 8 8'>
                <path strokeLinecap='round' strokeWidth='1.5' d='M1 1l6 6m0-6L1 7' />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
