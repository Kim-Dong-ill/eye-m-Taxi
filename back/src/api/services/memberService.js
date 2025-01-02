import memberDao from '../dao/memberDao.js'

const test = async () => {
    try {
        const result = await memberDao.test()
        return result
    } catch (error) {
        console.log(error);
        throw error
    }
}

export default {
    test
}
