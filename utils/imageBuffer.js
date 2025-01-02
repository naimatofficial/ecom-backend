// import sharp from "sharp";

// // Function to compress the image and return a Base64 string

// export async function compressAndConvertToBase64(image) {
//   try {
//     // Check if the image input is a valid Buffer or a Base64 string
//     let imageBuffer;
//     if (typeof image === "string" && image.startsWith("data:image/")) {
//       // If the image is a Base64 string, convert it to a Buffer
//       const base64Data = image.split(",")[1]; // Split the Base64 string to get the data part
//       imageBuffer = Buffer.from(base64Data, "base64");
//     } else if (Buffer.isBuffer(image)) {
//       imageBuffer = image; // If it's already a Buffer, use it directly
//     } else {
//       throw new TypeError("Input must be a valid Base64 string or a Buffer");
//     }

//     // Use sharp to compress the image
//     const compressedImage = await sharp(imageBuffer)
//       .jpeg({ quality: 80 }) // Compress the image with 80% quality
//       .toBuffer();

//     // Convert the compressed buffer back to Base64
//     const compressedBase64 = compressedImage.toString("base64");

//     // Optionally, return the full Base64 string with metadata
//     return `data:image/jpeg;base64,${compressedBase64}`;
//   } catch (error) {
//     console.error("Error during image compression:", error);
//     throw error;
//   }
// }
