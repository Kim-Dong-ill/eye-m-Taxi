import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axios";

export const loginUser = createAsyncThunk(
  "/member/login",
  async ({ body, handleLoginError }, thunkAPI) => {
    
    try {
      const res = await axiosInstance.post("/member/login", body);
      console.log("로그인 요청 URL:", axiosInstance.defaults.baseURL + "/member/login");

      console.log("로그인 성공", res.data);

      return res.data;
    } catch (error) {
      console.log("로그인 에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || error.message 
        || "로그인에 실패했습니다.";

      if (handleLoginError) {
        handleLoginError(errorMessage);
      }
      return thunkAPI.rejectWithValue(error.response.data || error.message);
    }
  }
);

export const authUser = createAsyncThunk("/member/auth", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/member/auth"); //여기에 토큰 데리고 온다.
    console.log(res.data);
    return res.data;
  } catch (error) {
    // console.log(error);
    return thunkAPI.rejectWithValue(error.response.data || error.message);
  }
});

