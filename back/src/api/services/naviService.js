// // api/services/naviService.js
// import axios from 'axios';

// const getDirections = async (origin, destination, waypoints) => {
//   try {
//     const response = await axios.post(
//       'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
//       {
//         origin,
//         destination,
//         waypoints,
//         priority: 'RECOMMEND',
//         car_fuel: 'GASOLINE',
//         car_hipass: false,
//         alternatives: false,
//         road_details: false,
//       },
//       {
//         headers: {
//           Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     console.log("여기");
//     return response.data;
//   } catch (error) {
//     console.error('Error in service:', error.message);
//     throw error; // 에러를 다시 던져서 컨트롤러에서 처리하도록 함
//   }
// };

// export default {
//   getDirections,
// };
