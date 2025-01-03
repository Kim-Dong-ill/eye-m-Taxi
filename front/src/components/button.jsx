import React from "react";
import "../css/components/button.scss";
import { useNavigate } from "react-router-dom";

function Button({ btnData }) {
  const navigate = useNavigate();

//   return (
//     <div className="button" onClick={() => navigate(btnData.link)}>
//       {btnData.text}
//     </div>
//   );
// }

return (
  <button 
    className="button" 
    onClick={() => {
      if (btnData.onClick) {
        btnData.onClick();
      } else if (btnData.link) {
        navigate(btnData.link);
      }
    }}
    type={btnData.type || 'button'}
  >
    {btnData.text}
  </button>
);
}

export default Button;
