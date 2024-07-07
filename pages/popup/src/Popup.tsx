import '@src/Popup.css';
import { FiSun } from 'react-icons/fi';
import { LuMoon } from 'react-icons/lu';

import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

import { ComponentPropsWithoutRef, useEffect, useState } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'SCRAPE_URL', url }, response => {
      if (response.status === 'error') {
        setError(response.message);
      } else {
        setContent(response.data);
      }
    });
  }, [url]); // Dependency array includes `url` to trigger effect when `url` changes
  console.log(content);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#eee' : '#222',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
        <ToggleButton>{theme === 'light' ? <FiSun size={15} /> : <LuMoon size={15} />}</ToggleButton>
        <img src={chrome.runtime.getURL('popup/sunglass.svg')} className="App-logo" alt="logo" />

        <p>Wear For Good</p>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <button
      className={
        ' toggleButton' +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
