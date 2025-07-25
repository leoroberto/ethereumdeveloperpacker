const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

app.get(`/`, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get(`/usuario/:id`, (req, res) => {
  res.send(`Usuario ${req.params.id}`);
});

app.listen(port, () => {
  console.log(`Server running at <http://localhost:${port}>`);
});

