// import naviService from '../services/naviService.js';

// const getDirections = async (req, res) => {
//   try {
//     const { origin, destination, waypoints } = req.body;
//     const directions = await naviService.getDirections(origin, destination, waypoints);
//     res.status(200).json(directions); // 카카오 내비 API의 응답 데이터를 그대로 반환
//   } catch (error) {
//     console.error('Error in controller:', error.message);
//     res.status(500).json({ error: 'Failed to fetch route' });
//   }
// };

// export default {
//   getDirections,
// };
