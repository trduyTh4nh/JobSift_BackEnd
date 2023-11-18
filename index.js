const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const post = require('./post');
const bcrypt = require('bcrypt');
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


const stripe = require('stripe')('sk_test_51ODOjFDqDQ31HEFQoMajoFb6sEX4MK9Fut3sUuArNPEJBBhFDfll7aVqCg3G3keNtWY6VuCvY1wX8CTuqZO3Ppp700zX3wH6vo');

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


app.post('/payment-sheet', async (req, res) => {
    const { price } = req.body;
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2023-10-16' }
    );

    const amountInVND = price; // Số tiền VND
    const amountInVNDInCents = Math.round(amountInVND * 100); // Chuyển đổi VND sang cent và làm tròn


    // Tiếp tục xử lý paymentIntent với amountInVNDInCents
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInVNDInCents,
        currency: 'vnd',
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: 'pk_test_51ODOjFDqDQ31HEFQwTDCiTH1AyfrMZGiFNjgitItFOyPkQliWEUJEC4RkcspbyNpm8n7sxwH5VZEdc7oy9ZHqGOT00LByYtfnn'
    });

    // // const vndAmount = price;
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: price,
    //     currency: 'vnd',
    //     customer: customer.id,
    //     // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    //     automatic_payment_methods: {
    //         enabled: true,
    //     },
    // });

    // res.json({
    //     paymentIntent: paymentIntent.client_secret,
    //     ephemeralKey: ephemeralKey.secret,
    //     customer: customer.id,
    //     publishableKey: 'pk_test_51ODOjFDqDQ31HEFQwTDCiTH1AyfrMZGiFNjgitItFOyPkQliWEUJEC4RkcspbyNpm8n7sxwH5VZEdc7oy9ZHqGOT00LByYtfnn'
    // });
});

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
<<<<<<< HEAD

// app.post('/buykc', async (req, res) => {
//     const { iduser, kc } = req.body;
//     try {
//         const user = await db.oneOrNone('SELECT * FROM users WHERE id_user = $1', iduser);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         const newDiamondCount = parseInt(user.diamond_count) + parseInt(kc);

//         await db.none('UPDATE users SET diamond_count = $1 WHERE id_user = $2', [newDiamondCount, iduser]);

//         return res.status(200).json({ message: 'Successfully updated diamond count' });
//     } catch (error) {
//         console.log('Error:', error);
//         return res.status(500).json({ error: error.message || 'Internal server error' });
//     }
// });

app.post('/buykc', (req, res) => {
    const { iduser, kc } = req.body

    console.log(req.body)

    const getKCcurrent = `SELECT * FROM users WHERE id_user = ${iduser}`

    db.oneOrNone(getKCcurrent)
        .then((e) => {
            const quantityDAM = e.diamond_count;
            const upgradeKC = `UPDATE users SET diamond_count = ${parseInt(kc) + parseInt(quantityDAM)} WHERE id_user = ${iduser}`
            db.none(upgradeKC)
                .then((e) => {
                    res.status(200).json({ message: "successfully!" })
                    return
                })
                .catch((error) => {
                    console.log("ERROR at line 119: " + error)
                    res.status(500).json({ error: error })

                })
        })
        .catch((error) => {
            console.log("ERROR at line 113: " + error)
            res.status(500).json({ error: error })
        })
})




=======
app.get('/enterprise/statistics/:id', (req, res) => {
    const bd = req.params.id
    post.getCompanyStatistics(bd).then(e => {
        res.status(200).send(e)
    }).catch(e => {
        console.log(`ERROR in /enterprise/statistics/${bd}: ${e}`)
        res.status(500).send({ status: 500, at: `ERROR in /enterprise/statistics/${bd}`, e: e })
    })
})
>>>>>>> eee29762fa531ff76f2efc80c8f7a16dce696232
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
    if (bd.id_ntd) {
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

app.post('/getallcv/:iduser', (req, res) => {
    const iduser = req.params.iduser

    const query = `SELECT * FROM cv c, ung_vien uv, users u 
    WHERE u.id_user = uv.id_user and u.id_user = ${iduser}`

    db.many(query)
        .then((result) => {
            if (result.length <= 0) {
                res.status(401).json({ message: "[401] - line 204" })
                return
            }
            res.status(200).json({ result: result })
        })
        .catch((error) => {
            console.log("ERROR at line 238: " + error)
            res.status(500).json({ error: error })
        })

})

app.post('/deletecv/:idcv', (req, res) => {
    const idcv = req.params.idcv

    const deletecv = `DELETE FROM cv WHERE id_cv = ${idcv}`

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
    VALUES ($1, $2, $3, $4, $5, $6) returning id_user
    `;


    db.oneOrNone(insertQR, [email, password, phone, full_name, profile_picture, diamond_count])
        .then((e) => {
            console.log(JSON.stringify(e))
            const insertUV = `INSERT INTO ung_vien (id_user) VALUES (${e.id_user})`

            db.none(insertUV).
                then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    res.status(500).json({ error: error });
                })
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
        priceTo,
        position
    } = req.body;
    console.log(priceTo)
    console.log(currency)
    console.log("Data đã lấy: " + JSON.stringify(req.body))

    const insertQR = `
      INSERT INTO "post" (tieu_de, nganh_nghe, soluong_nguoi, job_category, dia_chi, job_time, gioi_tinh, luong, trinh_do_hoc_van, kinh_nghiem_yeu_cau, phuc_loi, note, id_ntd, highest_salary, currency, position, ngay_post)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
        currency,
        position,
        new Date()
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


app.post('/loginntd', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.oneOrNone(`SELECT * FROM users u, nha_tuyen_dung ntd WHERE ntd.id_user = u.id_user and email = '${email}' and password = '${password}'`);

        if (!user) {
            res.status(401).json({ message: 'Tài khoản mật khẩu không chính xác!' });
            return;
        }
        res.status(200).json({ message: 'Login thành công!', checkUser: false, user: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
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
        FROM post p, doanh_nghiep dn, nha_tuyen_dung ntd, loai_cong_viec l, vi_tri v 
        WHERE views > 1000
        and p.id_ntd = ntd.id_ntd and ntd.id_dn = dn.id_dn and l.id_loai = p.nganh_nghe and v.id_vitri = p.position 
        `)



        if (popularjob.length === 0) {
            res.status(200).json({ message: "Not available!" })
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
app.post('/signupntd', (req, res) => {
    const {
        email,
        emaildn,
        imglogo_firebase,
        nameCompany,
        password,
        phone,
        username,
        address,
        cordinate,
        description
    } = req.body



    console.log(req.body)

    const queryCheckUser = `SELECT * FROM users WHERE email = '${email}'`
    db.oneOrNone(queryCheckUser)
        .then((check) => {
            if (check) {
                console.log("Null " + check)
                res.status(404).json({ status: 404, message: 'Email user trùng' })
                return
            }
            const queryCheckEnterprise = `SELECT * FROM doanh_nghiep WHERE email_dn = '${emaildn}'`
            db.oneOrNone(queryCheckEnterprise).
                then((kq) => {
                    if (kq) {
                        console.log("Null enterprise" + check)
                        res.status(404).json({ status: 404, message: 'Email doanh nghiệp trùng' })
                        return
                    }

                    const queryAddUser = `INSERT INTO users (email, password, phone, full_name, diachi) VALUES ('${email}', '${password}', '${phone}', '${username}', '${address}') returning id_user`
                    db.oneOrNone(queryAddUser)
                        .then((result) => {
                            const newIdUser = result.id_user

                            const queryAddEnterprise = `INSERT INTO doanh_nghiep (name_dn, email_dn, logo_dn, address, cordiante, banner, description, category, phone_dn) VALUES ('${nameCompany}', '${emaildn}', '${imglogo_firebase}', '${address}', '${cordinate}', '', '${description}', '', '') returning id_dn`
                            db.oneOrNone(queryAddEnterprise)
                                .then((result2) => {

                                    const newIdEnterprise = result2.id_dn
                                    console.log("ID doanh nghiệp: " + newIdEnterprise)

                                    const queryAddNhaTuyenDung = `INSERT INTO nha_tuyen_dung (id_user, id_dn) VALUES (${newIdUser}, ${newIdEnterprise})`
                                    db.oneOrNone(queryAddNhaTuyenDung)
                                        .then((result3) => {
                                            res.status(200).json({ message: "Signup Successfully!" })
                                        })
                                        .catch((error) => {

                                            console.log("ERROR at line 937: " + error)
                                            res.status(500).json({ error: error })
                                        })
                                })
                                .catch((error) => {
                                    console.log("ERROR at line 942: " + error)
                                    res.status(500).json({ error: error })
                                })

                        }).catch((error) => {
                            console.log("ERROR at line 953")
                            res.status(500).json({ error: error })
                        })

                })
                .catch((error) => {
                    console.log("ERROR at line: 948")
                    res.status(500).json({ error: error })
                })
        })
        .catch((error) => {
            console.log("ERROR at line 957: " + error)
            res.status(500).json({ error: error })
        })




})


const generateCV = async (working_experience, education, activity, language, certificate) => {

}
// 
app.post('/genratecv/:iduser', (req, res) => {
    const idUser = req.params.iduser
    const {
        imageUserCV,
        nameUserCV,
        birthUserCV,
        introductionUserCV,
        desGoalCV,
        ngon_ngu,
        job_category,
        kinh_nghiem,
        position,
        working_experience,
        education,
        activity,
        language,
        certificate
    } = req.body
    console.log("Body: " + JSON.stringify(working_experience))


    const check = `SELECT uv.id_ungvien FROM users u, ung_vien uv WHERE u.id_user = uv.id_user AND u.id_user = ${idUser}`
    db.one(check)
        .then((e) => {
            if (e === null) {
                res.status(401).json({ message: '[401 - not found user]' })
            }

            const insertCV = ` INSERT INTO cv (cv_title, ngon_ngu, loai_cong_viec, kinh_nghiem, nhu_cau, introduction, goal, file_imagge, id_ungvien, position) VALUES ('${nameUserCV + ' ' + position}', '${ngon_ngu}', '${job_category}', '${kinh_nghiem}', 'không có', '${introductionUserCV}', '${desGoalCV}', '${imageUserCV}', ${e.id_ungvien}, '${position}') returning id_cv`
            console.log(insertCV)
            db.oneOrNone(insertCV)
                .then((e) => {
                    const id_return = e
                    var insertArr = []
                    for (var i = 0; i < working_experience.length; i++) {
                        insertArr.push(`('${working_experience[i].nameCompany}', '${working_experience[i].dateStart ? working_experience[i].dateStart : (new Date()).toLocaleDateString('en-US')}', '${working_experience[i].dateEnd ? working_experience[i].dateEnd : (new Date()).toLocaleDateString('en-US')}','${id_return.id_cv}', '${working_experience[i].position}')`)
                    }
                    const insertWE = `
                        INSERT INTO working_experience_cv (ten_doanh_nghiep, start_day, end_day, id_cv, position) VALUES ${insertArr.join(',')}
                    `
                    console.log(insertWE)
                    db.none(insertWE)
                        .then((e) => {
                            console.log('Success WE')
                            insertArr = []
                            for (var i = 0; i < education.length; i++) {
                                insertArr.push(`('${education[i].nameSchool}', '${education[i].major}' , '${education[i].dateStart ? education[i].dateStart : (new Date()).toLocaleDateString('en-US')}' , '${education[i].dateEnd ? education[i].dateEnd : (new Date()).toLocaleDateString('en-US')}' , ${id_return.id_cv}, '${education[i].description}')`)
                            }
                            const insertEdu = `
                                    INSERT INTO education (nameschool, major, startdate, enddate, id_cv, description) VALUES ${insertArr.join(',')}
                                `
                            db.none(insertEdu)
                                .then((e) => {
                                    insertArr = []
                                    console.log('Success Edu')
                                    for (var i = 0; i < activity.length; i++) {
                                        insertArr.push(`('${activity.nameOrganize}', '${activity.position}' ,'', '${activity[i].dateStart ? activity[i].dateStart : (new Date()).toLocaleDateString('en-US')}', '${activity[i].dateEnd ? activity[i].dateEnd : (new Date()).toLocaleDateString('en-US')}', '${activity[i].description}', ${id_return.id_cv})`)
                                    }
                                    const insertAC = `
                                        INSERT INTO activity_cv (name, position, working, start_day, end_day, mo_ta, id_cv) VALUES ${insertArr.join(',')}
                                        `
                                    db.none(insertAC)
                                        .then((e) => {
                                            insertArr = []
                                            console.log('Success AC')
                                            for (var i = 0; i < language.length; i++) {
                                                insertArr.push(`('${language[i].language}', '${language[i].level}', '${language[i].description}', ${id_return.id_cv})`)
                                            }
                                            const insertLang = `
                                                INSERT INTO language (name, level, description, id_cv) VALUES ${insertArr.join(',')}
                                                `
                                            db.none(insertLang)
                                                .then((e) => {
                                                    console.log('Success Lang')
                                                    res.status(200).send({ status: 200 })


                                                })
                                                .catch((error) => {
                                                    console.log(error + " line 935")
                                                    res.status(500).json({ error: error })
                                                })
                                        })
                                        .catch((error) => {
                                            console.log(error + " line 921")
                                            res.status(500).json({ error: error })
                                        })
                                })
                                .catch((error) => {
                                    console.log(error + " line 907")
                                    res.status(500).json({ error: error })
                                })
                        })
                        .catch((error) => {
                            console.log(error + " line 893")
                            res.status(500).json({ error: error })
                        })


                    for (var i = 0; i < certificate.length; i++) {
                        const insertCer = `
                            INSERT INTO certificate_cv (name_cert, noi_dung, id_cv, ngaycap) VALUES ('${certificate[i].nameCer}', '${certificate[i].description}' ,${id_return.id_cv} , '${certificate[i].dateStart ? certificate[i].dateStart : (new Date()).toLocaleDateString('en-US')}')
                        `
                        db.none(insertCer)
                            .then((e) => {
                                console.log('Success WE')
                            })
                            .catch((error) => {
                                console.log(error + " line 949")
                                res.status(500).json({ error: error })
                            })
                    }
                })
                .catch((error) => {
                    console.log(error + " line 959")
                    res.status(500).json({ error: error })
                })
        })
        .catch((error) => {
            console.log(error + " line 964")
            res.status(500).json({ error: error })
        })
})


app.post('/getdnofntd/:iddn', (req, res) => {
    const idDN = req.params.iddn

    const getDn = `SELECT * FROM doanh_nghiep WHERE id_dn = ${idDN}`

    db.oneOrNone(getDn)
        .then((kq) => {
            res.status(200).json({ enterprise: kq })
        })
        .catch((error) => {
            console.log("ERROR at line 1129: " + error)
            res.status(500).json({ error })
        })
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



app.post('/removecv/:idcv', (req, res) => {
    const idcv = req.params.idcv

    const queryRemoveCV = `DELETE FROM cv WHERE id_cv = ${idcv}`

    db.none(queryRemoveCV)
        .then((response) => {
            res.status(200).json({ message: "Successfully!" })
        })
        .catch((error) => {
            res.status(500).json({ error: error })
        })
})

app.post(`/getallposition`, (req, res) => {
    {
        const getAllPosition = `SELECT * FROM vi_tri`
        db.many(getAllPosition)
            .then((e) => {
                res.status(200).json({ allPosition: e })
            })
            .catch((error) => {
                {
                    console.log("ERROR at line 1304: " + error)
                    res.status(500).json({ error: error })
                }
            })
    }
})

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});





