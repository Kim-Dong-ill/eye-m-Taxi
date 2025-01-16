

// 뒤로가기 화살표
const ARROW_SVG = `data:image/svg+xml,%3Csvg width='54' height='54' viewBox='0 0 54 54' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25.8303 46.0801C24.9396 46.0805 24.084 45.7334 23.4453 45.1126L7.69528 29.3626C6.37924 28.0449 6.37924 25.9103 7.69528 24.5926L23.4453 8.8426C24.3014 7.99052 25.547 7.65989 26.713 7.97525C27.879 8.29062 28.7881 9.20406 29.098 10.3715C29.4079 11.5389 29.0714 12.783 28.2153 13.6351L18.2423 23.6249H43.92C45.784 23.6249 47.295 25.136 47.295 26.9999C47.295 28.8639 45.784 30.3749 43.92 30.3749H18.2533L28.2153 40.3201C29.1793 41.2853 29.4674 42.7359 28.9456 43.9963C28.4237 45.2566 27.1944 46.0789 25.8303 46.0801Z' fill='currentColor'/%3E%3C/svg%3E`;

//로고
const LOGO_SVG = `data:image/svg+xml,%3Csvg width='200' height='120' viewBox='0 0 200 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M38.44 91.44C32.04 91.44 26.6 90.24 22.12 87.84C17.72 85.44 14.36 82.12 12.04 77.88C9.72 73.64 8.56 68.76 8.56 63.24C8.56 57.96 9.92 53.2 12.64 48.96C15.36 44.72 19 41.36 23.56 38.88C28.12 36.32 33.2 35.04 38.8 35.04C46.32 35.04 52.48 37.24 57.28 41.64C62.16 45.96 65.32 52.24 66.76 60.48L25.96 73.44L22.24 64.32L51.76 54.36L48.28 55.92C47.64 53.84 46.48 52.04 44.8 50.52C43.2 48.92 40.76 48.12 37.48 48.12C35 48.12 32.8 48.72 30.88 49.92C29.04 51.04 27.6 52.68 26.56 54.84C25.6 56.92 25.12 59.4 25.12 62.28C25.12 65.56 25.72 68.32 26.92 70.56C28.12 72.72 29.76 74.36 31.84 75.48C33.92 76.6 36.24 77.16 38.8 77.16C40.64 77.16 42.4 76.84 44.08 76.2C45.84 75.56 47.56 74.72 49.24 73.68L56.68 86.16C53.88 87.76 50.84 89.04 47.56 90C44.36 90.96 41.32 91.44 38.44 91.44Z' fill='currentColor'/%3E%3Crect y='21.2362' width='7.8' height='18' rx='3.9' transform='rotate(-32.4586 0 21.2362)' fill='currentColor'/%3E%3Crect x='29.85' y='10.001' width='7.8' height='18' rx='3.9' fill='currentColor'/%3E%3Crect x='59.0165' y='13.75' width='7.8' height='18' rx='3.9' transform='rotate(25.3849 59.0165 13.75)' fill='currentColor'/%3E%3Crect x='29.4' y='48.4' width='11.7754' height='11.7754' rx='5.88769' fill='currentColor'/%3E%3C/svg%3E`;

// 마이크
const MIC_SVG = `data:image/svg+xml,%3Csvg width='312' height='312' viewBox='0 0 312 312' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.8'%3E%3Cpath d='M257.662 152.75C257.662 147.365 253.296 143 247.912 143C242.527 143 238.162 147.365 238.162 152.75C238.544 175.218 229.975 196.916 214.343 213.06C198.711 229.204 177.301 238.468 154.832 238.81C132.363 238.468 110.952 229.204 95.3204 213.06C79.6886 196.916 71.1193 175.218 71.5016 152.75C71.5016 147.365 67.1364 143 61.7516 143C56.3668 143 52.0016 147.365 52.0016 152.75C51.7063 206.18 91.9461 251.141 145.082 256.75V289.25C145.082 294.635 149.447 299 154.832 299C160.216 299 164.582 294.635 164.582 289.25V257.79C218.118 252.144 258.497 206.577 257.662 152.75Z' fill='currentColor' stroke='currentColor' stroke-width='9.75'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M221 156C221 191.899 191.899 221 156 221C120.101 221 91 191.899 91 156V91C91 55.1015 120.101 26 156 26C191.899 26 221 55.1015 221 91V156ZM156 45.5C130.871 45.5 110.5 65.871 110.5 91V156C110.5 181.129 130.871 201.5 156 201.5C181.129 201.5 201.5 181.129 201.5 156V91C201.5 65.871 181.129 45.5 156 45.5Z' fill='currentColor' stroke='currentColor' stroke-width='9.75'/%3E%3C/g%3E%3C/svg%3E`;

// 큰 별
const BIG_STAR_SVG = `data:image/svg+xml,%3Csvg width='270' height='256' viewBox='0 0 270 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M135 0.1875L180.889 78.4263L270 97.5889L209.25 165.106L218.435 255.188L135 218.676L51.5659 255.188L60.7505 165.106L0.000488281 97.5889L89.1114 78.4263L135 0.1875Z' fill='currentColor'/%3E%3C/svg%3E`;

// 전화
const CALL_SVG = `data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M70.2435 95.0235C73.8362 97.3448 78.1174 98.3564 82.3672 97.8882C86.6171 97.42 90.5764 95.5005 93.5793 92.4526L96.2046 89.8817C97.3556 88.7026 98 87.1192 98 85.4703C98 83.8213 97.3556 82.2379 96.2046 81.0588L85.0618 70.0157C83.8944 68.8667 82.3231 68.2228 80.6863 68.2228C79.0495 68.2228 77.4782 68.8667 76.3108 70.0157C75.1336 71.1684 73.5526 71.8139 71.9062 71.8139C70.2598 71.8139 68.6788 71.1684 67.5015 70.0157L49.9997 52.4869C49.4158 51.9107 48.9522 51.2239 48.6357 50.4666C48.3193 49.7093 48.1563 48.8965 48.1563 48.0755C48.1563 47.2545 48.3193 46.4418 48.6357 45.6844C48.9522 44.9271 49.4158 44.2404 49.9997 43.6641C51.1469 42.4949 51.7898 40.9212 51.7898 39.2819C51.7898 37.6426 51.1469 36.0689 49.9997 34.8997L38.9151 23.7981C37.7379 22.6454 36.1569 22 34.5105 22C32.8641 22 31.2831 22.6454 30.1059 23.7981L27.5389 26.4275C24.4956 29.4351 22.5791 33.4004 22.1116 37.6568C21.6441 41.9132 22.6542 46.201 24.972 49.7992C37.0485 67.6244 52.4146 82.9744 70.2435 95.0235Z' stroke='currentColor' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Crect x='3.5' y='3.5' width='113' height='113' rx='56.5' stroke='currentColor' stroke-width='7'/%3E%3Crect width='21.4053' height='28' transform='translate(20 37.9009) rotate(-47.9749)' fill='currentColor'/%3E%3Crect width='14.6319' height='69.8561' transform='translate(22 46.1812) rotate(-44.0928)' fill='currentColor'/%3E%3Crect width='14.6319' height='27.3687' transform='translate(68 76.1812) rotate(-44.0928)' fill='currentColor'/%3E%3Crect width='14.6319' height='25.1778' transform='translate(72.5171 73.6499) rotate(-0.826553)' fill='currentColor'/%3E%3C/svg%3E`;

// 자물쇠
const LOCK_SVG = `data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.194 20.853C20.194 19.4778 19.0792 18.363 17.704 18.363C16.3288 18.363 15.214 19.4778 15.214 20.853C15.2119 21.436 15.4195 22.0004 15.799 22.443C16.1813 22.8414 16.3138 23.4176 16.144 23.943L15.829 24.873C15.7071 25.2913 15.7877 25.7424 16.0467 26.0926C16.3057 26.4428 16.7134 26.652 17.149 26.658H18.259C18.709 26.6579 19.1312 26.4407 19.3931 26.0747C19.6549 25.7088 19.7241 25.239 19.579 24.813L19.204 23.883C19.0341 23.3576 19.1667 22.7814 19.549 22.383C19.9369 21.9646 20.1653 21.4229 20.194 20.853Z' fill='currentColor' stroke='currentColor'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M24.829 12.183V7.50303C24.8298 6.28041 24.3331 5.11008 23.4532 4.26126C22.5732 3.41244 21.3858 2.9582 20.164 3.00303H15.244C14.0222 2.9582 12.8347 3.41244 11.9548 4.26126C11.0748 5.11008 10.5781 6.28041 10.579 7.50303V12.183C7.47174 13.277 5.58205 16.4265 6.07897 19.683L7.50397 28.338C8.20681 31.7857 11.2763 34.2362 14.794 34.158H20.614C24.1568 34.2469 27.2482 31.77 27.934 28.293L29.359 19.638C29.8289 16.3889 27.9293 13.2627 24.829 12.183ZM12.829 7.50303C12.8858 6.22448 13.9652 5.23223 15.244 5.28303H20.164C21.4428 5.23223 22.5222 6.22448 22.579 7.50303V11.658H12.829V7.50303ZM25.204 27.843L26.704 19.158C26.8528 18.0344 26.4957 16.9027 25.729 16.068C24.7965 15.0106 23.4486 14.4134 22.039 14.433H13.369C11.9641 14.4058 10.6169 14.9917 9.67897 16.038C8.9305 16.8928 8.60072 18.036 8.77897 19.158L10.204 27.843C10.669 29.9825 12.6065 31.4768 14.794 31.383H20.614C22.8014 31.4768 24.7389 29.9825 25.204 27.843Z' fill='currentColor' stroke='currentColor'/%3E%3C/svg%3E`;

// 사운드
const SOUND_SVG = `data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M64.4 27.4808C65.8563 26.509 67.5693 25.9937 69.32 26.0008C71.7059 25.9468 74.0123 26.8598 75.7149 28.5322C77.4174 30.2046 78.3714 32.4943 78.36 34.8808V85.0408C78.375 88.3576 76.5484 91.4089 73.6178 92.9624C70.6872 94.5158 67.1367 94.3149 64.4 92.4408L38.8 75.3608C37.3359 74.3695 35.6081 73.84 33.84 73.8408H26.92C24.558 73.8514 22.289 72.9206 20.615 71.2541C18.941 69.5876 18 67.3229 18 64.9608V54.9608C18 52.5987 18.941 50.334 20.615 48.6675C22.289 47.001 24.558 46.0702 26.92 46.0808H33.84C35.6081 46.0816 37.3359 45.5521 38.8 44.5608L64.4 27.4808Z' fill='currentColor' stroke='currentColor' stroke-width='2'/%3E%3Crect x='85.396' y='42.5752' width='14' height='6' rx='3' transform='rotate(-20 85.396 42.5752)' fill='currentColor'/%3E%3Crect x='86' y='58' width='14' height='6' rx='3' fill='currentColor'/%3E%3Crect x='87.4482' y='73.7866' width='14' height='6' rx='3' transform='rotate(20 87.4482 73.7866)' fill='currentColor'/%3E%3Crect x='3.5' y='3.5' width='113' height='113' rx='56.5' stroke='currentColor' stroke-width='7'/%3E%3C/svg%3E`;

//사용자
const PERSON_SVG = `data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M29.37 25.065L29.73 26.775C30.0712 28.2534 29.7343 29.8069 28.8115 31.0112C27.8887 32.2155 26.4763 32.9448 24.96 33H11.04C9.52378 32.9448 8.11137 32.2155 7.18854 31.0112C6.26571 29.8069 5.92887 28.2534 6.27002 26.775L6.63002 25.065C7.04407 22.7501 9.03395 21.049 11.385 21H24.615C26.9661 21.049 28.956 22.7501 29.37 25.065ZM24.96 30.735C25.7217 30.7262 26.4385 30.3733 26.91 29.775V29.79C27.4886 29.0643 27.714 28.1187 27.525 27.21L27.165 25.5C26.9653 24.2327 25.897 23.2838 24.615 23.235H11.385C10.1031 23.2838 9.03477 24.2327 8.83502 25.5L8.47502 27.21C8.29076 28.1139 8.51592 29.0529 9.09002 29.775C9.56152 30.3733 10.2783 30.7262 11.04 30.735H24.96Z' fill='currentColor'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.75 18H17.25C13.9363 18 11.25 15.3137 11.25 12V8.03996C11.246 6.70205 11.7757 5.41778 12.7218 4.47173C13.6678 3.52568 14.9521 2.99596 16.29 2.99996H19.71C21.0479 2.99596 22.3322 3.52568 23.2782 4.47173C24.2243 5.41778 24.754 6.70205 24.75 8.03996V12C24.75 15.3137 22.0637 18 18.75 18ZM16.29 5.24996C14.7491 5.24996 13.5 6.49909 13.5 8.03996V12C13.5 14.071 15.1789 15.75 17.25 15.75H18.75C20.8211 15.75 22.5 14.071 22.5 12V8.03996C22.5 7.30001 22.2061 6.59036 21.6828 6.06713C21.1596 5.54391 20.45 5.24996 19.71 5.24996H16.29Z' fill='currentColor'/%3E%3C/svg%3E`;

export { 
  ARROW_SVG, 
  LOGO_SVG, 
  MIC_SVG, 
  BIG_STAR_SVG, 
  CALL_SVG, 
  LOCK_SVG, 
  SOUND_SVG,
  PERSON_SVG
};