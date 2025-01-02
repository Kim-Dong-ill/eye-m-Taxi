import { db, schema } from '../../config/dbConfig.js'

const test = async () => {
    
    const query = `SELECT * FROM ${schema}.test`

    try {
        const result = await db.query(query)
        return result.rows
    } catch (error) {
        console.log(error);
        throw error
    }
}



export default {
    test
}
