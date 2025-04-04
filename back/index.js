const express = require('express');
const app = express();
const PORT = process.env.PORT || 3200;
const db = require('./models');
const cors = require('cors');

app.use(cors());

app.use(express.json())

app.use('/movie', require('./routes/movie.routes'));

db.sequelize.sync().then(()=>{
  app.listen(PORT, ()=>console.log(`Server running on https://localhost:${PORT}`));
});