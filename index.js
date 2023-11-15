const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const post = require('./post');

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));

// const userRouter = require('./router/user');p
const pgp = require('pg-promise')();
const userSignup = require('./models/user');
const { errors, as } = require('pg-promise');
const { stat } = require('fs');
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

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

// app.use(express.json());
// app.use('/user', userRouter);
app.use(bodyParser.json())
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
})
// app.use(userSignup)

// app.use(bodyParser.text({
//     type: 'text/plain'
// }));
io.on('connection', (socket) => {
    console.log(`Socket: ${socket.id}`)
    socket.emit('id', socket.id)
    socket.on('newMsg', (body) => {
        io.sockets.emit('newMsg', { body: body, id: socket.id })
    })
    socket.on('kcValChange', (body) => {
        io.sockets.emit('kcValChange', { kcInfo: body, id: socket.id })
    })
})
io.listen(3002)
app.post('/post/:id', (req, res) => {
    const bd = req.params.id
    post.getPostNTD(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /post/${bd}: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /post/${bd}`, e: e })
    })
})
app.post('/report/get', (req, res) => {
    const bd = req.body
    post.getReport(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /report/get: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /report/get`, e: e })
    })
})
app.post('/report/add', (req, res) => {
    const bd = req.body
    post.postReport(bd).then(e => {
        res.status(200).send({ status: e })
    }).catch(e => {
        console.log(`ERROR in /report/add: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /report/add`, e: e })
    })
})
app.post('/diamond/set', (req, res) => {
    const bd = req.body
    post.setKC(bd).then(e => {
        res.status(200).send({ status: e })
    }).catch(e => {
        console.log(`ERROR in /diamond/set: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /diamond/set`, e: e })
    })
})
app.post('/diamond/:id', (req, res) => {
    const id = req.params.id
    console.log(req.params)
    post.getDiamondCount(id).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /diamond/${id}: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /diamond/${id}`, e: e })
    })
})


app.post('/applicationuser', (req, res) => {
    const bd = req.body
    post.getApplication(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /applicationuser: ${e}`)
        res.status(500).send({ status: 500, at: '/applicationuser', e: e })
    })
})
app.post('/createchat', (req, res) => {
    const bd = req.body
    post.checkUngVien(bd.id_user).then(e => {
        console.log(`[DEBUG @ /createchat @ checkUngVien] ${JSON.stringify(e)}`)
        const newBD = { ...bd, id_user: e[0].id_ungvien }
        console.log(`[DEBUG @ /createchat @ checkUngVien] ${JSON.stringify(newBD)}`)
        post.checkChat(newBD).then(e => {
            if (!e) {
                post.createChat(newBD).then(f => {
                    res.status(200).send(f)
                }).catch(g => {
                    console.log(`ERROR in /createchat @ createChat: ${g}`)
                    res.status(500).send({ status: 500, at: '/createchat @ createchat', e: e })
                })
            } else {
                console.log('Already exist')
                post.getntdFromChat(e[0]).then(h => {
                    res.status(200).send(h)
                }).catch(i => {
                    console.log(`ERROR in /createchat @ getntdFromChat: ${i}`)
                    res.status(500).send({ status: 500, at: '/createchat @ getntdFromChat', e: i })
                })
            }
        }).catch(e => {
            console.log(`ERROR in /createchat @ checkChat: ${e}`)
            res.status(500).send({ status: 500, at: '/createchat @ checkChat', e: e })
        })
    }).catch(e => {
        console.log(`ERROR in /createchat @ checkUngVien: ${e}`)
        res.status(500).send({ status: 500, at: '/createchat @ checkUngVien', e: e })
    })
})
app.post('/ungvien', (req, res) => {
    post.getUV().then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /ungvien: ${e}`)
        res.status(500).send({ status: 500, at: '/ungvien', e: e })
    })
})
app.post('/ntd', (req, res) => {
    post.getAllNTD().then(e => {
        console.log('sent')
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /ntd: ${e}`)
        res.status(500).send({ status: 500, at: '/ntd', e: e })
    })
})
app.use(bodyParser.urlencoded({ extended: false }))
app.post('/postmsg', (req, res) => {
    console.log(`/postmsg: ` + JSON.stringify(req.body))
    const bd = req.body
    post.postMessage(bd).then(e => {
        res.status(200).send({ message: 'Success' })
    }).catch(e => {
        console.log(`ERROR in /postmsg: ${e}`)
        res.status(500).send({ status: 500, at: '/postmsg', e: e })
    })
})
app.post('/getmsg', (req, res) => {
    const bd = req.body
    post.getChat(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /getmsg: ${e}`)
        res.status(500).send({ status: 500, at: '/getmsg', e: e })
    })
})

app.post('/chat', (req, res) => {
    const bd = req.body
    if(bd.id_ntd){
        post.getChat(bd).then(e => {
            res.status(200).send(e)
        }).catch(e => {
            console.log(`ERROR in /chat @ {getChat}: ${e}`)
            res.status(500).send({ status: 500, at: '/addfavourite & getChat', e: e })
        })
        return
    }
    post.checkUngVien(bd.id_user).then(e => {
        console.log(e)
        post.getChat(e[0]).then(e => {
            res.status(200).send(e)
        }).catch(e => {
            console.log(`ERROR in /chat @ {getChat}: ${e}`)
            res.status(500).send({ status: 500, at: '/addfavourite & getChat', e: e })
        })
    }).catch(e => {
        console.log(`ERROR in /chat @ {checkUngVien}: ${e}`)
        res.status(500).send({ status: 500, at: '/addfavourite & checkUngVien', e: e })
    })
})

app.post('/getntd', (req, res) => {
    const bd = req.body
    post.getNTD(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /getntd: ${e}`)
        res.status(500).send({ status: 500, at: '/getntd', e: e })
    })
})

app.post('/getpostfavourite', (req, res) => {
    const bd = req.body
    post.isExistInFavourite(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /getpostfavourite: ${e}`)
        res.status(500).send({ status: 500, at: '/getpostfavourite & removeFavourite', e: e })
    })
})

app.post('/addfavourite', (req, res) => {
    const bd = req.body
    post.isExistInFavourite(bd).then(e => {
        if (e) {
            post.removeFavourite(bd).then(e => {
                res.status(200).send({ msg: 'Success remove favourite' })
            }).catch(e => {
                console.log(`ERROR in /addfavourite @ {removeFavourite}: ${e}`)
                res.status(500).send({ status: 500, at: '/addfavourite & removeFavourite', e: e })
            })
        } else {
            post.addFavourite(bd).then(e => {
                res.status(200).send({ msg: 'Success add favourite' })
            }).catch(e => {
                console.log(`ERROR in /addfavourite @ {addFavourite}: ${e}`)
                res.status(500).send({ status: 500, at: '/addfavourite & addFavourite', e: e })
            })
        }
    }).catch(e => {
        console.log(`ERROR in /addfavourite @ {isExsistInFavourite}: ${e}`)
        res.status(500).send({ status: 500, at: '/addfavourite & isExsistInFavourite', e: e })
    })
})

app.post('/cvcount', async (req, res) => {
    var user = req.body;
    post.getCVCountFromUser(user.id_user).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR AT /cvcount ${e}`)
        res.status(500).send({ error: 500, msg: 'ERROR AT /cvcount', callStack: e })
    })
})


app.post('/apply', async (req, res) => {
    var application = req.body;
    console.log(JSON.stringify(application))
    post.apply(application).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR AT /apply ${e}`)
        res.status(500).send({ error: 500, msg: 'ERROR AT /apply', callStack: e })
    })
})
app.post('/application', async (req, res) => {
    var { id_post, id_user } = req.body
    if (!id_post) {
        post.getApplyUser(id_user).then(e => {
            res.status(200).send(e)
        }).catch(e => {
            console.log(`ERROR AT /application ${e}`)
            res.status(500).send({ error: 500, msg: 'ERROR AT /application', callStack: e })
        })
    } else {
        post.getApplyWithIdPostIdUser(id_post, id_user).then(e => {
            res.status(200).send(e[0])
        }).catch(e => {
            console.log(`ERROR AT /application ${e}`)
            res.status(500).send({ error: 500, msg: 'ERROR AT /application', callStack: e })
        })
    }
})
app.post('/getcv', async (req, res) => {
    var { id_post, id_user } = req.body
    console.log(JSON.stringify(req.body))
    post.getApplyWithIdPostIdUser(id_post, id_user).then(e => {
        const id_cv = e[0].idcv
        post.getCV(id_cv).then(e => {
            res.status(200).send(e)
        }).catch(e => {
            console.log(`ERROR AT /apply ${e}`)
            res.status(500).send({ error: 500, msg: 'ERROR AT /apply', callStack: e })
        })
    }).catch(e => {
        console.log(`ERROR AT /apply ${e}`)
        res.status(500).send({ error: 500, msg: 'ERROR AT checking ungvien', callStack: e })
    })

})
app.post('/createcv', async (req, res) => {
    var cv = req.body;
    console.log(JSON.stringify(cv))
    post.checkUngVien(cv.id_ungvien).then((r) => {
        if (r.length == 0) {
            res.status(401).send({ error: 401, message: 'ERROR AT checkUngVien(): User is not a candidate.' })
            return
        }
        cv = {
            ...cv,
            id_ungvien: r[0].id_ungvien
        }
        console.log(JSON.stringify(r))
        post.addCV(cv).then((e) => {
            post.getLatestCV().then((e) => {
                res.status(200).send(e)
            }).catch((e) => {
                console.log(`ERROR AT /createcv [in data fetching process.]`)
                res.status(500).send({ error: 500, msg: 'ERROR AT /createcv [in data fetching process.]', callStack: e })
            })
        }).catch((e) => {
            console.log(`ERROR AT /createcv ${e}`)
            res.status(500).send({ error: 500, msg: 'ERROR AT /createcv', callStack: e })
        })
    }).catch(e => {
        console.log(e)
        res.status(500).send({ error: 500, msg: 'ERROR AT checkUngVien', callStack: e })
    })

})


app.post('/updateUser', async (req, res) => {
    const user = req.body;
    post.updateUser(user).then((e) => {
        res.status(200).send({ code: 200, rowsUpdated: e })
        console.log('[200]: Update người dùng thành công.')
    }).catch((e) => {
        console.log('error' + e)
        if (e == 404) {
            res.status(404).send({ code: 404, error: 'No user found' })
        }
    })
})

app.post('/updateAvatarUser', async (req, res) => {
    const { id_user, image_picture } = req.body;

    try {
        db.none(`UPDATE users SET profile_picture = '${image_picture}' WHERE id_user = ${id_user}`);
        res.status(200).json({ code: 200, message: 'Successfully!', img_picture: image_picture });
        console.log('[200]: Update avatar thành công');

    } catch (error) {
        res.status(500).json({ error: error });
        console.error(`[500 - ${error}]`);
    }
});


app.post('/favourite', async (req, res) => {
    const { id_user } = req.body
    var date = new Date()
    post.getFavourite(id_user).then((e) => {
        console.log(`[200 - ${date}]: Lấy post yêu thích thành công.`)
        res.status(200).send(e)
    }).catch((error) => {
        if (error == 404) {
            res.status(404).send({ code: 404, message: 'Unable to find posts.' })
            return
        }
        if (error == 401) {
            console.log(`[401 - ${date}]: Unauthorized access to Favourites`)
            res.status(401).send({ code: 401, message: 'Unauthorized to view response, please login.' })
            return
        }
        console.log(`[500 - ${date}]: Lỗi database.`)
        res.status(500).send({ code: 500, message: 'Internal server error.' })
    })
})
app.post('/addfavourite', async (req, res) => {
    const { id_user, id_post } = req.body;
    console.log('[debug]: ' + id_user + ' ' + id_post)
    post.postFavourite(id_user, id_post).then(() => {
        res.status(200).send(req.body)
    })
})


app.post(`/getpostby`, async (req, res) => {
    const { id_post } = req.body
    try {
        const fecthPost = await db.oneOrNone(`SELECT * FROM post WHERE id_post = ${id_post}`)
        if (!fecthPost) {
            res.status(404).json({ error: "lỗi tại /getpostby/:idpost" })
        } else {
            res.status(200).json({ dataPost: fecthPost })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
    }

})


app.post('/countfollow/:iduser', (req, res) => {

    const iduser = req.params.iduser
    const query = db.oneOrNone(`SELECT count(*) as count
    FROM follow
    WHERE id_user = ${iduser}`)
        .then((e) => {
            if (e === null) {
                res.status(401).json({ message: "[401] - Not available!" })
                return
            }
            res.status(200).json({ follow: e })
        })
        .catch((error) => {
            res.status(500).json({ error: error })
        })

   
})


app.post("/addrating", async (req, res) => {

    //lấy rating ra từ user
    const { iduser, id_post, numberstar } = req.body

    db.oneOrNone(`SELECT * FROM "rate" where iduser = ${iduser} and id_post = ${id_post}`).
        then((respone) => {

            if (respone !== null) {
                db.oneOrNone(`UPDATE "rate" SET numberstar = ${numberstar} WHERE iduser = ${iduser} and  id_post = ${id_post}`)
                    .then(() => {
                        res.status(200).json({ message: "Successfully!" })
                        return
                    })
                    .catch((error) => {
                        console.log(error)
                        res.status(500).json({ error: "Failed!" })
                        return
                    })
            }
            else {
                db.none('INSERT INTO "rate" (iduser, id_post, numberstar) VALUES ($1, $2, $3)',
                    [iduser, id_post, numberstar])
                    .then(() => {
                        res.status(200).json({ message: "Successfully!" })
                    })
                    .catch((error) => {
                        console.error(error)
                        res.status(500).json({ error: "Invalid" })
                    })
            }
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({ error: error })
        })
    //fetch kết quả
    //check: nếu kết quả có (lenght > 0) thì update
    //ngược lại nếu kết quả ko có (length = 0) thì add
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
    const idNTd = 1
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
        id_user,
        currency,
        priceTo
    } = req.body;
    console.log(priceTo)
    console.log(currency)
    console.log("Data đã lấy: " + JSON.stringify(req.body))

    const insertQR = `
      INSERT INTO "post" (tieu_de, nganh_nghe, soluong_nguoi, job_category, dia_chi, job_time, gioi_tinh, luong, trinh_do_hoc_van, kinh_nghiem_yeu_cau, phuc_loi, note, id_ntd, highest_salary, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        id_user,
        priceTo,
        currency
    ])
        .then(() => {
            res.status(200).json({ message: 'Post created successfully', data: req.body });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.post('/upfeedback', async (req, res) => {

    const { idpost, iduser, content, time } = req.body
    console.log("IDPOST: " + idpost + "IDUSER: " + iduser + "CONTENT: " + content + "TIME: " + time)


    db.none(`INSERT INTO "feedback" (idpost, iduser, content, time)  
        VALUES ($1, $2, $3, $4)
        `, [idpost, iduser, content, time])
        .then(() => {
            res.status(200).json({ message: "Upload feedback successfully!" })
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({ error: "Internal Server Error" })
        })

})


// lấy toàn bộ feed back của post
app.get('/upfeedback/:idpost', async (req, res) => {
    const idPost = req.params.idpost

    try {
        const fbs = await db.manyOrNone(`SELECT fb.*, full_name, u.profile_picture FROM feedback fb, post ps, users u WHERE fb.idpost = ps.id_post and idpost = ${idPost} and fb.iduser = u.id_user`);
        if (!fbs || fbs.length === 0) {
            res.status(404).json({ error: 'No data found' });
            return
        }
        res.status(200).json({ fbs: fbs });

    }
    catch (error) {
        console.error("Feedback" + error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.get('/upfeedback/getrate/:idpost', async (req, res) => {
    const idpost = req.params.idpost
    try {
        const rate = await db.manyOrNone(`SELECT sum(numberstar) as start, count(iduser) as user FROM rate WHERE id_post = ${idpost}`);

        res.status(200).json({ rate: rate })
        console.log(JSON.stringify(rate))
    }
    catch (error) {
        console.error('error')
        res.status(500).json({ error: 'Internal Server Error' })
    }
})



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

app.post('/ntd/:idntd', async (req, res) => {
    const idNtd = req.params.idntd
    try {
        const ntd = await db.oneOrNone(`SELECT dn.* FROM nha_tuyen_dung td, doanh_nghiep dn WHERE td.id_dn = dn.id_dn AND id_ntd = ${idNtd}`)
        if (!ntd) {
            res.status(404).json({ error: 'Lỗi data' })
        }

        res.status(200).json({ ntd: ntd })
    }
    catch (error) {
        console.log(
            'errpr'
        )
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// search mạnh

app.post(`/search/:key`, async (req, res) => {
    const nameJob = req.params.key

    // console.log("NAME JOB: " + nameJob)

    try {
        const resultSearch = await db.many(`SELECT * 
        FROM post p, doanh_nghiep dn, nha_tuyen_dung ntd 
        WHERE LOWER(p.tieu_de) LIKE LOWER('${nameJob}%') 
        AND p.id_ntd = ntd.id_ntd 
        AND ntd.id_dn = dn.id_dn
    `)

        if (!resultSearch || resultSearch.length === 0) {
            res.status(401).json({ message: "[401 - Search] Not available" })
            return
        }
        res.status(200).json({ result: resultSearch })
        return
    }
    catch (error) {
        res.status(500).json({ error: error, warning: "Error tại /search:key" })
        return
    }
})

app.post(`/searchfilter`, async (req, res) => {

    const { nameJob, company, category, position, salaryFrom, salaryTo } = req.body

    console.log(req.body)

    try {
        const resultFilterSearch = await db.many(`
        SELECT * 
        FROM post p
        JOIN nha_tuyen_dung ntd ON p.id_ntd = ntd.id_ntd
        JOIN doanh_nghiep dn ON ntd.id_dn = dn.id_dn
        WHERE p.tieu_de ILIKE $1
        AND dn.name_dn ILIKE $2
        AND p.job_category ILIKE $3
        AND p.position ILIKE $4
        AND p.luong BETWEEN $5 AND $6
    `, [
            `${nameJob}%`,
            `${company}%`,
            `${category}%`,
            `${position}%`,
            salaryFrom == '' ? 0 : Number(salaryFrom),
            salaryTo == '' ? 900000000 : Number(salaryTo)
        ]);

        if (!resultFilterSearch || resultFilterSearch.length === 0) {
            res.status(401).json({ message: '[401 - Search] Not available' });
            return;
        }

        res.status(200).json({ result: resultFilterSearch, message: '[200 - Successfully]' })
        return
    }
    catch (error) {
        console.error('Error executing the query:', error);
        res.status(500).json({ error: error.message, warning: '[500 - Server invalid]' });
    }

})

app.post(`/getcurrentstar/:iduser/:idpost`, async (req, res) => {
    // const { iduser, idpost } = req.body;

    const iduser = req.params.iduser
    const idpost = req.params.idpost


    try {
        const currentstar = await db.oneOrNone(`SELECT r.* FROM rate r, post ps WHERE r.id_post = ps.id_post and r.iduser = ${iduser} and r.id_post = ${idpost}`)

        if (!currentstar) {
            res.status(401).json({ error: "Lỗi ngay cái getcurrentstar" })
            return
        }
        res.status(200).json({ cur: currentstar })
    }
    catch (error) {
        console.log("Error: " + error)
        res.status(500).json({ error: error })

    }
})

app.post(`/getinfontd`, async (req, res) => {
    const { id_ntd, id_post } = req.body

    try {
        const getDN = await db.oneOrNone(`SELECT DISTINCT dn.* 
        FROM post ps, nha_tuyen_dung ntd, doanh_nghiep dn
        WHERE ps.id_ntd = ntd.id_ntd 
          AND ps.id_ntd = ${id_ntd} 
          AND ntd.id_dn = dn.id_dn;`)


        const getQuantityPost = await db.oneOrNone(`SELECT count(p.*)
        FROM post p, nha_tuyen_dung n, doanh_nghiep dn, post ps
        WHERE p.id_ntd = n.id_ntd AND n.id_dn = dn.id_dn AND p.id_post = ${id_post}`)

        const getNTDByID = await db.oneOrNone(`SELECT u.* FROM users u, nha_tuyen_dung ntd WHERE u.id_user = ntd.id_user and ntd.id_ntd = ${id_ntd}`)

        if (!getDN || !getQuantityPost || !getNTDByID) {
            return res.status(401).json({ error: "Lỗi ngay cái /getinfontd" })
        }

        res.status(200).json({ ntd: getDN, numberpost: getQuantityPost, user_ntd: getNTDByID })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: error })
    }
})

app.post('/checkfollow', async (req, res) => {
    const { id_user, id_dn } = req.body;
    db.manyOrNone(`SELECT * FROM follow WHERE id_user = $1 and id_dn = $2`, [id_user, id_dn])
        .then((response) => {
            if (response.length > 0) {
                res.status(200).json({ checked: true });
            } else {
                res.status(200).json({ checked: false });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        });
});


app.post('/unfollow', async (req, res) => {
    const { id_user, id_dn } = req.body;

    db.manyOrNone(`DELETE FROM follow WHERE id_user = $1 and id_dn = $2`, [id_user, id_dn])
        .then((respone) => {
            res.status(200).json({ message: "Delete Successfully!" })
            return
        })
        .catch((error) => {
            res.status(500).json({ error: error })
            return
        })
})

app.post('/follow', async (req, res) => {
    const { id_user, id_dn } = req.body
    const date = new Date()
    const time = date.toLocaleDateString()
    try {
        const follow = db.oneOrNone(`INSERT INTO follow(id_user, id_dn, date_fl) VALUES(${id_user}, ${id_dn}, '${time}')`)
        if (!follow) {


        }
        console.log('[200 - Successfully')
        return res.status(200).json({ message: "Follow Successfully!" })


    } catch (error) {
        console.log(`[500 - ${error}]`)
        res.status(500).json({ error: error })
    }
})

app.post('/popularjob', async (req, res) => {
    try {
        const popularjob = await db.manyOrNone(`
        SELECT * 
        FROM post p, doanh_nghiep dn, nha_tuyen_dung ntd
        WHERE views > 1000
        and p.id_ntd = ntd.id_ntd and ntd.id_dn = dn.id_dn
        `)



        if (popularjob.length === 0) {
            res.status(401).json({ message: "Not available!" })
            return
        }

        res.status(200).json({ popularjob: popularjob })
        return
    }
    catch (error) {
        console.log(`[500 - ${error}]`)
        res.status(500).json({ error: error })
        return
    }
})


app.post('/updateView', (req, res) => {
    const { id_post, numberView } = req.body

    try {
        const updateView = db.oneOrNone(`UPDATE "post" SET views = ${numberView} WHERE id_post = ${id_post}`)

        if (!updateView) {
            return res.status(401).json({ error: "Lỗi tại API /updateView" })
        }

        res.status(200).json({ message: "Update Successfully!" })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
})


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


