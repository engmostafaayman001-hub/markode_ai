// server/frontend.ts
import express from "express";
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(10000, () => console.log("Frontend server running at http://localhost:10000"));
