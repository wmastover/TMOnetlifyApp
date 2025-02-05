import { EventSourcePolyfill } from 'event-source-polyfill';

export async function pingAPI(userImageBase64, clothingImageBase64, setTryOn, setVideo) {
  // Construct the URL with query parameters
  const queryParams = new URLSearchParams({
    user_image: userImageBase64,
    clothing_image: clothingImageBase64,
    clothing_category: "tops", // Assuming 'tops' as default, modify as needed
    adjust_hands: "false",
    long_top: "false"
  }).toString();
  const url = `https://will-1--sizeit-backend-runway-simple-fastapi-app.modal.run/api/v1/try-on-simple?${queryParams}`;

  // Initialize EventSource with GET method implicitly
  const eventSource = new EventSourcePolyfill(url);

  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.event === 'try_on') {
      setTryOn(data.url);
    } else if (data.event === 'video') {
      setVideo(data.url);
      eventSource.close();
    }
  };

  eventSource.onerror = function(error) {
    console.error('EventSource failed:', error);
    eventSource.close();
  };
}

export { callTryOnAPI };
