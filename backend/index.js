const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ImageKit = require("imagekit");
// require("dotenv").config();

const app = express();
const port = 5000;

// ✅ Fix: CORS middleware with proper config
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// ImageKit config
const imagekit = new ImageKit({
  publicKey: "public_Cr7CoG9/XzCeL5OmDv1n1OFLoNA=",
  privateKey: "private_xAVwf74bdOgC9yuua3Xsh0B5mRM=",
  urlEndpoint: "http://localhost:5000//ik.imagekit.io/6n5ifgqka",

});

// Upload Route
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("hello", req.file);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log(req.file)

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/uploads",
    });

    return res.json({ url: uploadResponse.url });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Test route (optional)
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(port, "localhost", () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
