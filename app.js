import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENTID,
  clientSecret: process.env.SPOTIFY_CLIENTSECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// Middleware autentikasi token access
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  spotifyApi.setAccessToken(token);
  next();
};

// Rute mendapatkan access token
app.get("/get-token", async (req, res) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    res.json({ access_token: accessToken }); //Token berlaku selama 1 jam.
  } catch (error) {
    res.status(500).json({ error: "Gagal mendapatkan access token" });
  }
});

// Rute mendapatkan audio analysis
app.get("/audio-analysis/:trackId", authenticateToken, async (req, res) => {
  const { trackId } = req.params;
  try {
    const data = await spotifyApi.getAudioAnalysisForTrack(trackId);
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ error: "Gagal mendapatkan audio analysis." });
  }
});

// Rute audio playback
app.get("/audio-playback/:trackId", authenticateToken, async (req, res) => {
  const { trackId } = req.params;
  try {
    const data = await spotifyApi.getTrack(trackId);
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ error: "Gagal mendapatkan audio playback." });
  }
});

// Rute rekomendasi
app.get("/recommendations", authenticateToken, async (req, res) => {
  const options = {
    limit: [1],
    seed_artists: ["4NHQUGzhtTLFvgF5SZesLK"],
    seed_genres: ["pop punk"],
    seed_tracks: ["0c6xIDDpzE81m2q797ordA"],
  };
  try {
    const data = await spotifyApi.getRecommendations(options);
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ error: "Gagal mendapatkan rekomendasi." });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
