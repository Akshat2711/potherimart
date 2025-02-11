export const Getlocation = () => {
    return new Promise((resolve, reject) => {
      // Check if the browser supports geolocation
      if (navigator.geolocation) {
        // Fetch the user's current position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // On success, resolve the promise with latitude and longitude
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            // On failure, reject the promise with an error message
            reject(err.message);
          }
        );
      } else {
        // If geolocation is not supported, reject with an error message
        reject("Geolocation is not supported by your browser.");
      }
    });
  };
  