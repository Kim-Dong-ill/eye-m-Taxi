from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import base64
import os
import logging
from google.cloud import logging as cloud_logging

app = Flask(__name__)
# Cloud Logging 설정
client = cloud_logging.Client()
client.setup_logging()

# 로거 생성
logger = logging.getLogger('plate_detection')
logger.setLevel(logging.INFO)

# 현재 파일의 디렉토리 경로를 기준으로 debug 폴더 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
debug_dir = os.path.join(current_dir, 'debug')

# 디버그 폴더 생성
debug_dir = 'debug'
if not os.path.exists(debug_dir):
    os.makedirs(debug_dir)

# CORS 설정 수정
ALLOWED_ORIGINS = []

# 환경에 따른 CORS 설정
if os.getenv('FLASK_ENV') == 'production':
    ALLOWED_ORIGINS = [
        'https://eyemtaxi-front-dot-winged-woods-442503-f1.du.r.appspot.com'
    ]
else:
    ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://192.168.106.239:5173'
    ]

# CORS 설정 적용
CORS(app, resources={
    r"/detect_plate": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["POST"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 600
    }
})
# Tesseract 경로 설정
pytesseract.pytesseract.tesseract_cmd = os.getenv('TESSERACT_PATH')

def detect_plate_area(image):
    # 1. Convert Image to Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite('debug/1_grayscale.jpg', gray)

    # 2. Gaussian Blur
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    cv2.imwrite(os.path.join(debug_dir, '2_blur.jpg'), blur)
    # 3. Adaptive Thresholding
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY_INV, 19, 9)
    
    # 4. Find Contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    # 5. Select Candidates by Size and Aspect Ratio
    plate_candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1000:  # 최소 크기 제한
            rect = cv2.minAreaRect(cnt)
            (x, y), (w, h), angle = rect
            aspect_ratio = max(w, h) / min(w, h)
            
            # 번호판 비율 검사 (2.3:1 ~ 4.7:1)
            if 2.3 <= aspect_ratio <= 4.7:
                box = cv2.boxPoints(rect)
                box = np.int0(box)
                
                # 디버깅: 후보 영역 표시
                debug_image = image.copy()
                cv2.drawContours(debug_image, [box], 0, (0, 255, 0), 2)
                cv2.imwrite(f'debug_candidate_{len(plate_candidates)}.jpg', debug_image)
                
                plate_candidates.append((box, area, angle))
    
    # 면적 기준 정렬
    return sorted(plate_candidates, key=lambda x: x[1], reverse=True)

def preprocess_plate(image, box, angle):
    # 6. Rotate Plate Images
    width = int(max(np.linalg.norm(box[0] - box[1]),
                   np.linalg.norm(box[2] - box[3])))
    height = int(max(np.linalg.norm(box[0] - box[3]),
                    np.linalg.norm(box[1] - box[2])))
    
    src_pts = box.astype("float32")
    dst_pts = np.array([[0, height-1],
                       [0, 0],
                       [width-1, 0],
                       [width-1, height-1]], dtype="float32")
    
    matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
    plate = cv2.warpPerspective(image, matrix, (width, height))
    
    if angle < -45:
        angle = 90 + angle
    if abs(angle) > 0:
        (h, w) = plate.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        plate = cv2.warpAffine(plate, M, (w, h))
    
    return plate

def enhance_plate(plate):
    # 7. Additional Image Processing
    gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    denoised = cv2.fastNlMeansDenoising(enhanced)
    
    # 8. Final Thresholding
    _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 디버깅: 전처리된 이미지 저장
    cv2.imwrite('debug_enhanced.jpg', binary)
    
    return binary

@app.route('/detect_plate', methods=['POST'])
def process_image():
    try:
        logging.info("번호판 인식 요청 받음")
        print("Request received")

        # 이미지 데이터 받기
        image_data = request.json['image']
        nparr = np.frombuffer(base64.b64decode(image_data.split(',')[1]), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 번호판 영역 검출
        plate_candidates = detect_plate_area(image)
        
        best_result = None
        highest_confidence = 0
        best_box = None  # 최적의 박스 좌표 저장용
        
        for box, area, angle in plate_candidates[:3]:
            # 번호판 영역 추출 및 보정
            plate = preprocess_plate(image, box, angle)
            enhanced_plate = enhance_plate(plate)
            
            # OCR 수행
            plate_text = pytesseract.image_to_string(
                enhanced_plate,
                lang='kor',
                config='--psm 7 --oem 3 -c tessedit_char_whitelist=0123456789가나다라마바사아자차카타파하'
            )
            
            # 정규식으로 번호판 형식 검증
            import re
            plate_pattern = re.compile(r'\d{2,3}[가-힣]\d{4}')
            matches = plate_pattern.findall(plate_text)
            
            if matches:
                confidence = pytesseract.image_to_data(
                    enhanced_plate,
                    lang='kor',
                    config='--psm 7 --oem 3',
                    output_type=pytesseract.Output.DICT
                )
                
                conf_values = [int(x) for x in confidence['conf'] if x != '-1']
                if conf_values:
                    avg_confidence = sum(conf_values) / len(conf_values)
                    if avg_confidence > highest_confidence:
                        highest_confidence = avg_confidence
                        best_result = matches[0]
                        best_box = box  # 최적의 박스 좌표 저장

        if best_result:
            # 9. Draw Rectangle on Original Image
            debug_result = image.copy()
            cv2.drawContours(debug_result, [best_box], 0, (0, 255, 0), 2)
            cv2.putText(debug_result, best_result, tuple(best_box[0]), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imwrite('debug_final_result.jpg', debug_result)
            
            # 10. Convert to Relative Coordinates
            height, width = image.shape[:2]
            relative_box = best_box.astype(float)
            relative_box[:, 0] = relative_box[:, 0] / width
            relative_box[:, 1] = relative_box[:, 1] / height

             # 디버그 이미지를 Base64로 변환
            _, buffer = cv2.imencode('.jpg', debug_result)
            debug_image_base64 = base64.b64encode(buffer).decode('utf-8')

            return jsonify({
                'success': True,
                'plate_number': best_result,
                'confidence': highest_confidence / 100,
                'plate_box': relative_box.tolist(),
                'debug_image': debug_image_base64
            })
        else:
            return jsonify({
                'success': False,
                'error': '번호판을 찾을 수 없습니다.'
            })
            
    except Exception as e:
        print('Error:', str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("Starting plate detection server...")
    app.run(host='0.0.0.0', port=5000, debug=True)  # host를 0.0.0.0으로 설정