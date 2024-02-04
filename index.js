const express = require("express");
const  bodyParser = require("body-parser");
const  pg = require("pg");
const dotenv = require("dotenv").config()

const app = express();
const port = 3000;


const db = new Client({
    connectionString: process.env.INTERNAL_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views','views');
let items = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes ORDER BY note_id ASC");
    items = result.rows;
    res.render("index", {
      notes: items,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const { title,text,category } = req.body;

  console.log( title,text,category);

  try {
    await db.query("INSERT INTO notes ( title,content,category) VALUES ($1, $2, $3)", [ title,text,category]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


app.get("/filter/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const result = await db.query("SELECT * FROM notes WHERE category = ($1) ", [category]);
    items = result.rows;
    res.render('index',{ notes:items})
   
  } catch (err) {
    console.log(err);
  }
});
app.get("/update/:id", async (req, res) => {  
    try {
        const id = req.params.id;
        const status  = true;
        await db.query("UPDATE notes SET status = ($1) WHERE note_id = ($2) ", [status,id]);
      res.redirect('/')
      
    } catch (err) {
      console.log(err);
    }
  });
app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;

  console.log(id);
  try {
    await db.query("DELETE FROM notes WHERE note_id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
