const app = require("./app");
const PORT = process.env.PORT || 3080;
app.listen(PORT, () => {
  console.log(`app is live at ${PORT}`);
});
