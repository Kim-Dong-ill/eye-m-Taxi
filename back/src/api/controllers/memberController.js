import memberService from "../services/memberService.js";
import jwt from "jsonwebtoken";

// 회원가입
const memberRegister = async (req, res) => {
  try {
    const data = req.body;

    const result = await memberService.memberRegister(data);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "register error",
      error: error.message,
    });
  }
};

// 로그인
const memberLogin = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;
    const result = await memberService.memberLogin(data);
    const token = jwt.sign({ userId: result.userId }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.send(
      {
        message: result.message,
        accessToken: token,
        userId: result.userId,
        phone: result.phone,
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "login error",
      error: error.message,
    });
  }
};

// 인증
const authUser = async (req, res) => {
  res.send({ message: "인증 성공" });
};

export default {
  memberRegister,
  memberLogin,
  authUser,
};
