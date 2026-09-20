const { ImageKit } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
    try {
        const result = await ImageKitClient.files.upload({
            file,
            fileName: "music_" + Date.now(),
            folder: "music-streaming-api/music",
        });
        return result;
    } catch (err) {
        console.log(err);
        throw new Error("File upload failed: " + err.message)
    }
}

module.exports = { uploadFile };