const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const post = require('./post');
// const userRouter = require('./router/user');
const pgp = require('pg-promise')();
const userSignup = require('./models/user');
const { errors } = require('pg-promise');
const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'JobSift_v1',
    user: 'postgres',
    password: '1234',
})
// const db = pgp({
//     host: 'db.yejwtqvhwplmyzushalg.supabase.co',
//     port: 5432,
//     database: 'JobSift_v1',
//     user: 'postgres',
//     password: 'JobSift@cnpmnc',
// })

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:19006');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

// app.use(express.json());
// app.use('/user', userRouter);
app.use(bodyParser.json())

// app.use(userSignup)

// app.use(bodyParser.text({
//     type: 'text/plain'
// }));

app.use(bodyParser.urlencoded({ extended: false }))


// app.post('/test', (req, res) => {
//     console.log('Request Body:', req.body);
//     console.log('Content-Type:', req.get('Content-Type'));
//     console.log(req.body);
//     res.json(req.body);
//     // Rest of your route handling logic
// });
app.post('/updateUser', async (req,res) => {
    const user = req.body;
    post.updateUser(user).then((e) => {
        res.status(200).send({code: 200, rowsUpdated: e})
        console.log('[200]: Update người dùng thành công.')
    }).catch((e) => {
        console.log('error')
        if(e == 404){
            res.status(404).send({code: 404, error: 'No user found'})
        }
    })
})
app.post('/favourite', async (req,res) => {
    const {id_user} = req.body
    var date = new Date()
    post.getFavourite(id_user).then((e) => {
        console.log(`[200 - ${date}]: Lấy post yêu thích thành công.`)
        res.status(200).send(e)
    }).catch((error) => {
        if(error == 404){
            res.status(404).send({code: 404, message: 'Unable to find posts.'})
            return
        }
        if(error == 401){
            console.log(`[401 - ${date}]: Unauthorized access to Favourites`)
            res.status(401).send({code: 401, message: 'Unauthorized to view response, please login.'})
            return
        }
        console.log(`[500 - ${date}]: Lỗi database.`)
        res.status(500).send({code: 500, message: 'Internal server error.'})
    })
})
app.post('/addfavourite', async (req,res) => {
    const {id_user, id_post} = req.body;
    console.log('[debug]: '+ id_user + ' ' + id_post)
    post.postFavourite(id_user, id_post).then(() => {
        res.status(200).send(req.body)
    })
}) 
app.post("/adduser", async (req, res) => {
   
    const { email, password, phone, full_name, profile_picture, diamond_count } = req.body;
    console.log("DATA" + req.body)

    console.log("Test 1 " + req.body["email"] + ' ' + req.body["password"] + ' ' + req.body["phone"])
    console.log("Test 5 " + req.body.email + ' ' + req.body.password + ' ' + req.body.phone)


    const insertQR = `
    INSERT INTO "users" (email, password, phone, full_name, profile_picture, diamond_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;


    db.none(insertQR, [email, password, phone, full_name, profile_picture, diamond_count])
        .then(() => {
         
            res.status(200).json(req.body);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        })
});

app.post("/addpost", async (req, res) => {
  const {
      tieu_de,
      nganh_nghe,
      soluong_nguoi,
      job_category,
      dia_chi,
      job_time,
      gioi_tinh,
      luong,
      trinh_do_hoc_van,
      kinh_nghiem_yeu_cau,
      phuc_loi,
      note,
      id_ntd,
  } = req.body;

  const insertQR = `
      INSERT INTO "post" (tieu_de, nganh_nghe, soluong_nguoi, job_category, dia_chi, job_time, gioi_tinh, luong, trinh_do_hoc_van, kinh_nghiem_yeu_cau, phuc_loi, note, id_ntd)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;

  db.none(insertQR, [
      tieu_de,
      nganh_nghe,
      soluong_nguoi,
      job_category,
      dia_chi,
      job_time,
      gioi_tinh,
      luong,
      trinh_do_hoc_van,
      kinh_nghiem_yeu_cau,
      phuc_loi,
      note,
      id_ntd,
  ])
      .then(() => {
          res.status(200).json({ message: 'Post created successfully', data: req.body });
      })
      .catch((error) => {
          console.log(error);
          res.status(500).json({ error: 'Internal Server Error' });
      });
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await db.oneOrNone('SELECT * FROM "users" WHERE email = $1', [email]);
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      if (password !== user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  



app.get('/', (request, result) => {
    post.getPost()
        .then(e => {
            console.log('OK (200)');
            result.status(200).send(e);
        })
        .catch(e => {
            console.log('ERROR (500)');
            result.status(500).send(e);
        });
});


app.listen(port, () => {
    console.log(`App running on port ${port}`);
});


