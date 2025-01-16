import memberRouter from './memberRouter.js'
import kakaoRouter from './kakaoRouter.js'
// import naviRouter from './naviRouter.js'
const mountRouter = (app) =>{

    // 멤버 라우터 마운트
    app.use('/member', memberRouter)

    // 카카오 라우터 마운트
    app.use('/kakao', kakaoRouter)

    // 내비 라우터 마운트
    // app.use('/api/navi', naviRouter); 

}

export default mountRouter;
