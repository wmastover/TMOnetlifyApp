import React, { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { pingAPI } from './functions/pingAPI';
import axios from 'axios';


export default function App() {
  // Parse URL parameters
  const queryParams = new URLSearchParams(window.location.search);
  const urlParam = queryParams.get('url'); // Access the 'url' parameter
  const imgParam = queryParams.get('img'); // Access the 'img' parameter

  const [uploadImageBase64, setUploadImageBase64] = useState('');
  const [urlImageBase64, setUrlImageBase64] = useState('');
  const [tryOn, setTryOn] = useState(null);
  const [video, setVideo] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tryOn) {
      console.log('tryOn has been updated:', tryOn);
      // Any additional logic when tryOn changes
    }
  }, [tryOn]); // This useEffect will run every time tryOn changes
  
  useEffect(() => {
    if (video) {
      console.log('video has been updated:', video);
      // Any additional logic when video changes
    }
  }, [video]);

  useEffect(() => {
    const encodeImageFromUrl = async (imageUrl) => {
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        // Convert the ArrayBuffer to a binary string
        const binary = new Uint8Array(response.data).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64Image = btoa(binary); // Encode the binary string to base64
        return base64Image;
      } catch (error) {
        console.error(`Error fetching image from URL: ${error}`);
        return null;
      }
    };

    if (imgParam) {
      encodeImageFromUrl(imgParam)
        .then(base64Image => {
          if (base64Image) {
            setUrlImageBase64(base64Image);
          }
        })
        .catch(console.error);
    }
  }, [imgParam]);

  

    // this block runs the api call
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Result = reader.result.split(',')[1]; // This removes the prefix if present
        setUploadImageBase64(base64Result);
        setIsLoading(true);
        try {
          const response = await pingAPI(base64Result, urlImageBase64, setTryOn, setVideo);
          setApiResponse(response);
          console.log("heres response: ", response)
        } catch (error) {
          console.error('Error pinging API:', error);
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white items-center justify-center" style={{ opacity: 1 }}>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : uploadImageBase64 ? (
        <>
          <h1 className="text-3xl font-bold">Heres your try on:</h1>
          <br/>
          <img  src={tryOn} alt="API Response Image" style={{ borderRadius: '10px', width: '90vw' }} />
          <video style={{ maxWidth: '90vw', maxHeight: '70vh' }} controls>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br/>
          <button className="mt-4 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
            Buy It Now
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold">Please Upload a Photo</h1>
          <br/>
          <label htmlFor="file-upload" className="cursor-pointer py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Upload File
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
        </>
      )}
    </div>
  );
}
