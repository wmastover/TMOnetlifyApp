import axios from 'axios';

export async function pingAPI(userImageBase64, clothingImageBase64, setTryOn, setVideo) {
    const BASE_URL = "https://haemaf-tryon--sizeit-backend-runway-simple-fastapi-app.modal.run";
    console.log("Starting the pingAPI function.");

    try {
        console.log("Sending POST request to initiate the try-on process.");
        const response = await axios.post(`${BASE_URL}/api/v1/try-on-simple`, {
            user_image: userImageBase64,
            clothing_image: clothingImageBase64,
            clothing_category: "tops",
            adjust_hands: true,
            long_top: false
        }, {
            headers: {'Accept': 'text/event-stream'},
        });

        
        if (!response.data || !response.data.session_id) {
            throw new Error("Missing session ID in response");
        }

        const sessionId = response.data.session_id; // Get session ID from API
        console.log(`Session ID received: ${sessionId}`);

        // Step 2: Open an EventSource connection to listen for updates
        console.log("Opening EventSource connection.");
        const eventSource = new EventSource(`${BASE_URL}/api/v1/try-on-simple?session_id=${sessionId}`);

        eventSource.onmessage = (event) => {
            console.log("Received event:", event.data);
            
            try {
                const parsedData = JSON.parse(event.data);
                console.log("Parsed event data:", parsedData);
                // onData(parsedData); // Pass event data to callback function
            } catch (error) {
                console.error("Error parsing event data:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("EventSource error:", error);
            eventSource.close();
            console.log("EventSource connection closed due to error.");
        };

        return () => {
            eventSource.close(); // Cleanup function to close the connection
            console.log("EventSource connection closed.");
        };

    } catch (error) {
        console.error("Error starting try-on process:", error);
    }
}
