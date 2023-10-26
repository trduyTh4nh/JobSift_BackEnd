const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'JobSift_v1',
    password: '1234',
    port: 5432
})
const getPost = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM post', (error, result) => {
            if(error){
                console.log('error: ' + error )
                reject(error)
            }
            resolve(result.rows)
        })


 
    })
}
const updateUser = async (user) => {
    return new Promise((resolve, reject) => {
        if(!user.id_user){
            reject(404)
            return
        }
        pool.query(`
            UPDATE users
            set email = '${user.email}', phone = '${user.phone}', full_name = '${user.full_name}', gioitinh = '${user.gioitinh}', diachi='${user.diachi}', ngaysinh='${user.ngaysinh}'
            WHERE id_user = ${user.id_user};
        `, (error, result) => {
            if(error){
                reject(error)
                return
            }
            resolve({code: 200, message: `Succesfully edited ${result.rowCount}`})
        })
    })
}
const getFavourite = (id_user) => {
    return new Promise((resolve, reject) => {
        if(id_user === undefined){
            reject(401)
            return
        }
        pool.query(`SELECT p.*, yt.id_post_yt
        FROM post_yeu_thich yt, post p
        WHERE yt.id_job = p.id_post AND yt.id_user = ${id_user}`, (error, result) => {
            if(error){
                console.log(error)
                reject(error)
            }
            if(result.rows.length == 0){
                reject(404)
            }
            resolve(result.rows)
        })
    })
}
const postFavourite = (id_user, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO post_yeu_thich (id_user, id_job) VALUES (${id_user}, ${id_post});`, (error,result) => {
            if(error){
                console.log(error)
                reject(error)
            }
            resolve({message: 'success'})
        })
    })
}
const setPost = (post) => {
    
}
const addCV = (cv) => {
    return new Promise((resolve, reject) => {
            pool.query(`INSERT INTO cv (file, id_ungvien) values ('${cv.file}', ${cv.id_ungvien})`, (error, result) => {
                if(error){
                    console.log(error)
                    reject(error)
                }
                resolve(200)                
            })
    })
}
const checkUngVien = (id_user) => {
   
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM ung_vien WHERE id_user = ${id_user};`, (error, result) => {
            if(error){
                console.log(error)
                reject(error)
            }
            resolve(result.rows)  
        })
    })
}
const apply = (application) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO don_ung_tien (status, idcv, id_post, id_user) values (0, ${application.idcv}, ${application.id_post}, ${application.id_user});`, (e,r) => {
            if(e){
                reject(e)
            }
            resolve({status: '200 success', rowsAffected: r.rowCount})
        })
    })
}
const getLatestCV = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id_cv
        FROM cv
        ORDER BY id_cv DESC
        LIMIT 1`, (error, result) => {
            if(error){
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
            if(error){
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
            if(error){
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
    getApplyWithIdPostIdUser
}