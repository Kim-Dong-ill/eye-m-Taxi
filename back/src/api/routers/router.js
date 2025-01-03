import memberRouter from './memberRouter.js'
import kakaoRouter from './kakaoRouter.js'
const mountRouter = (app) =>{

    // 멤버 라우터 마운트
    app.use('/member', memberRouter)

    // 카카오 라우터 마운트
    app.use('/kakao', kakaoRouter)

}

export default mountRouter;
