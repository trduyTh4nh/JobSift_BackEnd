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
const setPost = (post) => {
    
}
module.exports = {
    getPost
}