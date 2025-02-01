import axios from 'axios';
// import fs from 'fs';
import base64 from 'base-64';

// function encodeImageToBase64(imagePath) {
//     return new Promise((resolve, reject) => {
//         fs.readFile(imagePath, { encoding: 'base64' }, (err, data) => {
//             if (err) reject(err);
//             else resolve(data);
//         });
//     });
// }

export async function pingAPI(userImageBase64, clothingImageBase64) {
    // const userImageBase64 = await encodeImageToBase64(userImagePath);
    // const clothingImageBase64 = await encodeImageToBase64(clothingImagePath);

    const BASE_URL = "https://haemaf-tryon--sizeit-backend-runway-simple-fastapi-app.modal.run";
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/try-on-simple`, {
            user_image: userImageBase64,
            clothing_image: clothingImageBase64,
            clothing_category: "tops",
            adjust_hands: true,
            long_top: false
        }, {
            responseType: 'json'
        });

        if (response.data) {
            console.log("Server response data:", response.data)
            const events = response.data.split('\n\n')
                .map(data => data.replace('data: ', ''))
                .filter(data => data.trim())
                .map(data => JSON.parse(data));

            const tryOnEvent = events.find(event => event.event === "try_on");
            const videoEvent = events.find(event => event.event === "video");
            if (tryOnEvent || videoEvent) {
                return {
                    tryOnUrl: tryOnEvent ? tryOnEvent.url : null,
                    videoUrl: videoEvent ? videoEvent.url : null
                };
            }
        }
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        console.error(`Error details: ${error.response ? error.response.data : 'No response data'}`);
        return null;
    }
}
