import '@src/Popup.css';
import { FiSun } from 'react-icons/fi';
import { LuMoon } from 'react-icons/lu';

import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

import { ComponentPropsWithoutRef, useEffect, useState } from 'react';

interface BackgroundResponse {
  status: string;
  content?: {
    openai_response: {
      cost_per_wear: number;
      durability_days: number;
    };
    matches: string[];
  };
  message?: string;
}

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const [urlLink, setUrl] = useState('');
  const [content, setContent] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [costPerWear, setCostPerWear] = useState<number | null>(null);
  const [durabilityDays, setDurabilityDays] = useState<number | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [ourRating, setRating] = useState<number | null>(null);

  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }
  useEffect(() => {
    // Get the current tab's URL
    const getUrl = async (): Promise<string | null> => {
      setLoading(true);
      try {
        const tab = await getCurrentTab();
        const url = tab.url || null;
        setUrl(url || '');
        return url;
      } catch (error) {
        setApiError(error.message);
        return null;
      }
    };

    // Function to send a message to the background script and wait for the response
    const sendMessageToBackground = (tabUrl: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'SCRAPE_URL', url: tabUrl }, response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(response);
          }
        });
      });
    };

    //    const fetchData = async () => {
    //     setLoading(true)
    //   const tabUrl: string | null = await getUrl();
    //   //send msg to bg script
    //    chrome.runtime.sendMessage({ type: 'SCRAPE_URL', url: tabUrl }, response => {
    //         if (response.status === 'error') {
    //           setError(response.message);
    //         } else {
    //           console.log("popup", response.content)
    //           setContent(response.content.openai_response);
    //           const parsedResponse = JSON.parse(response.data.openai_response);
    //           setCostPerWear(parsedResponse.cost_per_wear);
    //           setDurabilityDays(parsedResponse.durability_days);
    //           setMatches(response.content.matches);
    //           setLoading(false);
    //     }
    //   });
    // };
    // fetchData();
    // Function to fetch data and update the state
    const fetchData = async () => {
      setLoading(true);
      const tabUrl = await getUrl();
      if (tabUrl) {
        try {
          const response = await sendMessageToBackground(tabUrl);
          console.log('response', response);
          if (response.status === 'error') {
            setApiError(response.message);
          } else {
            //  response is an object with below keys:
            //  status: 'success',
            // matches: data.matches,
            // openai_response: data.openai_response,
            setCostPerWear(response.openai_response.cost_per_wear);
            setDurabilityDays(response.openai_response.durability_days);
            setMatches(response.matches);
            setRating(response.openai_response.rating);
          }
        } catch (error) {
          setApiError(error.message!);
        }
      } else {
        setApiError('No active tab found');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#eee' : '#222',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
        <ToggleButton>{theme === 'light' ? <FiSun size={15} /> : <LuMoon size={15} />}</ToggleButton>
        <img src={chrome.runtime.getURL('popup/sunglass.svg')} className="App-logo" alt="logo" />
        {apiError && <p>Error: {apiError}</p>}
        <p>Wear For Good</p>
        {!loading && (
          <div>
            {matches && matches.length > 0 && (
              <div>
                <p>Matches:</p>
                <ul>
                  {matches.map((match, index) => (
                    <li key={index}>{match}</li>
                  ))}
                </ul>
              </div>
            )}
            {costPerWear && (
              <p>
                Cost per wear is £{costPerWear.toFixed(2)} if you wear it for {durabilityDays} days
              </p>
            )}
            {ourRating && <p>Our Rating: {ourRating}</p>}
            {/* <p>Product: Black swimsuit</p>
            <p>Cost: £25</p>
     
            <p>Cost per wear is £0.025 if you wear it for 1000 days</p>
            <p>Durability Days: 1000 days</p>
            <p>Wear for good rec:Alternative</p> */}
          </div>
        )}
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
