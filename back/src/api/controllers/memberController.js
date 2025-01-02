import memberService from '../services/memberService.js'

const test = async (req, res) => {
    try {   
        const result = await memberService.test()
        res.send(result)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "test error",
            error: error.message
        })
    }
}

export default {
    test
}
