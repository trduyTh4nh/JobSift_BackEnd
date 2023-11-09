const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'JobSift_v1',
    password: '1234',
    port: 5432
})
const setKC = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`UPDATE users SET diamond_count = ${bd.diamond_count} WHERE id_user = ${bd.id_user}`, (e, r) => {
            if(e){
                rej(e)
                return
            }
            res(200)
        })
    })
}
const getDiamondCount = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`SELECT diamond_count
        FROM users
        WHERE id_user = ${bd};`, (e, r) => {
            if(e){
                rej(e)
                return
            }
            res(r.rows[0])
        })
    })
}
const getApplication = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`SELECT d.id_recruit, p.id_ntd, d.status, p.tieu_de, p.nganh_nghe, p.position, dn.name_dn, cv.*, d.date_ut
        FROM don_ung_tien d, post p, cv, nha_tuyen_dung ntd, doanh_nghiep dn
        WHERE d.id_post = p.id_post AND d.idcv = cv.id_cv AND d.id_user = ${bd.id_user} AND p.id_ntd = ntd.id_ntd AND ntd.id_dn = dn.id_dn
        ORDER BY status;`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            res(r.rows)
        })
    })
}
const checkChat = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`SELECT * FROM groupchat
        WHERE id_ungvien = ${bd.id_user} AND id_ntd = ${bd.id_ntd};`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            if (r.rows.length == 0) {
                res(false)
            } else {
                res(r.rows)
            }
        })
    })
}
const getntdFromChat = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`
        SELECT u.*, gc.id_chat
        FROM groupchat gc, nha_tuyen_dung ntd, users u
        WHERE gc.id_ntd = ntd.id_ntd AND ntd.id_user = u.id_user AND id_groupchat = ${bd.id_groupchat};
        `, (error, result) => {
            if (error) {
                rej(error)
                return
            }
            res(result.rows)
        })
    })
}
const createChat = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`
        INSERT INTO chat (chat_name, time_chat) VALUES ('${bd.tieu_de}', '${(new Date()).toLocaleTimeString()}') RETURNING id_chat
        `, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            console.log(r.rows)
            console.log(JSON.stringify(bd))
            pool.query(`
            INSERT INTO groupchat (id_ntd, id_ungvien, id_chat) VALUES (${bd.id_ntd}, ${bd.id_user}, ${r.rows[0].id_chat}) RETURNING id_groupchat
            `, (err, re) => {
                if (err) {
                    rej(err)
                    return
                }
                pool.query(`
                SELECT u.*, gc.id_chat
                FROM groupchat gc, nha_tuyen_dung ntd, users u
                WHERE gc.id_ntd = ntd.id_ntd AND ntd.id_user = u.id_user AND id_groupchat = ${re.rows[0].id_groupchat};
                `, (error, result) => {
                    if (error) {
                        rej(error)
                        return
                    }
                    res(result.rows)
                })
            })
        })
    })
}
const postMessage = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`INSERT INTO message 
        (content, id_user, id_chat, time, read) 
        VALUES ('${bd.content}', ${bd.id_user}, ${bd.id_chat}, '${bd.time}', false);`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            res(200)
        })
    })
}
const getChat = (bd) => {
    return new Promise((res, rej) => {
        if (bd.id_chat) {
            pool.query(`SELECT c.id_chat, msg.id_mess,  c.chat_name, msg.content, gc.id_ntd, msg.id_user, msg.time, u.full_name, u.profile_picture
            FROM chat c, groupchat gc, message msg, nha_tuyen_dung ntd, users u
            WHERE gc.id_chat = c.id_chat AND msg.id_chat = c.id_chat AND c.id_chat = ${bd.id_chat} AND ntd.id_user = u.id_user AND gc.id_ntd = ntd.id_ntd
            ORDER BY time;`, (e, r) => {
                if (e) {
                    rej(e)
                    return
                }
                res(r.rows)
            })
        } else {
            pool.query(`SELECT c.id_chat, c.chat_name, msg.content, gc.id_ntd, gc.id_ungvien, msg.time, u.full_name, u.profile_picture
            FROM chat c, groupchat gc, message msg, nha_tuyen_dung ntd, users u
            WHERE gc.id_chat = c.id_chat AND msg.id_chat = c.id_chat AND gc.id_ungvien = ${bd.id_ungvien} AND ntd.id_user = u.id_user AND gc.id_ntd = ntd.id_ntd
            ORDER BY msg.time DESC;`, (e, r) => {
                if (e) {
                    rej(e)
                    return
                }
                var result = []
                for (var row of r.rows) {
                    var repeated = false
                    console.log(JSON.stringify(row))
                    if (result.length == 0) {
                        result.push(row)
                        continue
                    }
                    for (var i of result) {
                        if (row.id_chat == i.id_chat) {
                            repeated = true
                            break
                        }
                    }
                    if (!repeated)
                        result.push(row)
                }
                res(result)
            })
        }

    })
}

const getNTD = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`SELECT u.*
                    FROM users u, nha_tuyen_dung ntd
                    WHERE ntd.id_user = u.id_user AND u.id_user = ${bd.id_user}`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            res(r.rows)
        })
    })
}
const addFavourite = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`INSERT INTO post_yeu_thich (id_user, id_job) VALUES (${bd.id_user}, ${bd.id_job})`, (e, r) => {
            if (e) {
                rej(e)
            }
            res(200)
        })
    })
}
const removeFavourite = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`DELETE FROM post_yeu_thich
        WHERE id_user = ${bd.id_user} AND id_job = ${bd.id_job}`, (e, r) => {
            if (e) {
                rej(e)
            }
            res(200)
        })
    })
}
const isExistInFavourite = (bd) => {
    return new Promise((res, rej) => {
        pool.query(`SELECT * FROM post_yeu_thich WHERE id_user = '${bd.id_user}' AND id_job = '${bd.id_job}'`, (error, result) => {
            if (error) {
                rej(error)
                return
            }
            var r = false
            if (result.rows.length > 0) {
                r = true
            }
            res(r)
        })
    })
}
const getPost = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM post p, doanh_nghiep dn, nha_tuyen_dung ntd WHERE p.id_ntd = ntd.id_ntd and ntd.id_dn = dn.id_dn', (error, result) => {
            if (error) {
                console.log('error: ' + error)
                reject(error)
            }
            resolve(result.rows)
        })

    })
}
const updateUser = async (user) => {
    return new Promise((resolve, reject) => {
        if (!user.id_user) {
            reject(404)
            return
        }
        pool.query(`
            UPDATE users
            set email = '${user.email}', phone = '${user.phone}', full_name = '${user.full_name}', gioitinh = '${user.gioitinh}', diachi='${user.diachi}', ngaysinh='${user.ngaysinh}'
            WHERE id_user = ${user.id_user};
        `, (error, result) => {
            if (error) {
                reject(error)
                return
            }
            resolve({ code: 200, message: `Succesfully edited ${result.rowCount}` })
        })
    })
}
const getFavourite = (id_user) => {
    return new Promise((resolve, reject) => {
        if (id_user === undefined) {
            reject(401)
            return
        }
        pool.query(`SELECT p.*, yt.id_post_yt, dn.name_dn, dn.logo_dn
        FROM post_yeu_thich yt, post p, nha_tuyen_dung n, doanh_nghiep dn
        WHERE yt.id_job = p.id_post AND yt.id_user = ${id_user} AND p.id_ntd = n.id_ntd AND n.id_dn = dn.id_dn`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            if (result.rows.length == 0) {
                reject(404)
            }
            resolve(result.rows)
        })
    })
}
const postFavourite = (id_user, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO post_yeu_thich (id_user, id_job) VALUES (${id_user}, ${id_post});`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve({ message: 'success' })
        })
    })
}
const setPost = (post) => {

}
const addCV = (cv) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO cv (file, id_ungvien) values ('${cv.file}', ${cv.id_ungvien})`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(200)
        })
    })
}
const getAllNTD = () => {
    return new Promise((res, rej) => {
        pool.query(`SELECT u.*, ntd.id_ntd
        FROM users u, nha_tuyen_dung ntd
        WHERE ntd.id_user = u.id_user;`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            res(r.rows)
        })
    })
}
const getUV = () => {
    return new Promise((res, rej) => {
        pool.query(`SELECT u.*, ntd.id_ungvien
        FROM users u, ung_vien ntd
        WHERE ntd.id_user = u.id_user;`, (e, r) => {
            if (e) {
                rej(e)
                return
            }
            res(r.rows)
        })
    })
}
const checkUngVien = (id_user) => {

    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM ung_vien WHERE id_user = ${id_user};`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}
const checkGC = (bd) => {
    return new Promise((res, rej) => {

    })
}
const apply = (application) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO don_ung_tien (status, idcv, id_post, id_user) values (0, ${application.idcv}, ${application.id_post}, ${application.id_user});`, (e, r) => {
            if (e) {
                reject(e)
            }

            resolve({ status: '200 success', rowsAffected: r.rowCount })

        })
    })
}
const getLatestCV = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id_cv
        FROM cv
        ORDER BY id_cv DESC
        LIMIT 1`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}
const getCV = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT *
        FROM cv
        WHERE id_cv = ${id}`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}
const getApplyWithIdPostIdUser = (id_post, id_user) => {
    console.log(id_post + ' ' + id_user)
    return new Promise((resolve, reject) => {
        pool.query(`SELECT *
        FROM don_ung_tien
        WHERE id_user = ${id_user} AND id_post = ${id_post}`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}

const getApplyUser = (id_user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT *
        FROM don_ung_tien
        WHERE id_user = ${id_user}`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}
const getCVCountFromUser = (id_user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT COUNT(c.*) as cv_count
        FROM users u, ung_vien uv, cv c
        WHERE uv.id_user = u.id_user AND c.id_ungvien = uv.id_ungvien AND uv.id_user = ${id_user}`, (error, result) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(result.rows)
        })
    })
}
module.exports = {
    getPost,
    postFavourite,
    getFavourite,
    updateUser,
    addCV,
    getLatestCV,
    checkUngVien,
    apply,
    getCV,
    getApplyWithIdPostIdUser,
    getApplyUser,
    getCVCountFromUser,
    addFavourite,
    isExistInFavourite,
    removeFavourite,
    getChat,
    getNTD,
    postMessage,
    getAllNTD,
    getUV,
    checkChat,
    createChat,
    getntdFromChat,
    getApplication,
    getDiamondCount,
    setKC
}