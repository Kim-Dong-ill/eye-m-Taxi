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

# 환경에 따른 .env 파일 로드
if os.getenv('FLASK_ENV') == 'production':
    load_dotenv('.env.production')
else:
    load_dotenv()

app = Flask(__name__)
# 환경 변수에서 허용된 도메인 가져오기
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS').split(',')

if os.getenv('ADDITIONAL_ORIGINS'):
    ALLOWED_ORIGINS.extend(os.getenv('ADDITIONAL_ORIGINS').split(','))

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
    # 번호판 영역 검출을 위한 전처리
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Adaptive Thresholding
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY_INV, 19, 9)
    
    # 윤곽선 검출
    contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    # 번호판 후보 영역 찾기
    plate_candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1000:  # 작은 노이즈 제거
            rect = cv2.minAreaRect(cnt)
            (x, y), (w, h), angle = rect
            aspect_ratio = max(w, h) / min(w, h)
            
            # 한국 번호판의 일반적인 종횡비 (2.3:1 ~ 4.7:1)
            if 2.3 <= aspect_ratio <= 4.7:
                box = cv2.boxPoints(rect)
                box = np.int0(box)
                plate_candidates.append((box, area, angle))
    
    return sorted(plate_candidates, key=lambda x: x[1], reverse=True)

def preprocess_plate(image, box, angle):
    # 번호판 영역 추출 및 보정
    width = int(max(np.linalg.norm(box[0] - box[1]),
                   np.linalg.norm(box[2] - box[3])))
    height = int(max(np.linalg.norm(box[0] - box[3]),
                    np.linalg.norm(box[1] - box[2])))
    
    src_pts = box.astype("float32")
    dst_pts = np.array([[0, height-1],
                        [0, 0],
                        [width-1, 0],
                        [width-1, height-1]], dtype="float32")
    
    # 투시 변환
    matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
    plate = cv2.warpPerspective(image, matrix, (width, height))
    
    # 각도 보정
    if angle < -45:
        angle = 90 + angle
    if abs(angle) > 0:
        (h, w) = plate.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        plate = cv2.warpAffine(plate, M, (w, h))
    
    return plate

def enhance_plate(plate):
    # 번호판 이미지 개선
    gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
    
    # 히스토그램 평활화
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # 노이즈 제거
    denoised = cv2.fastNlMeansDenoising(enhanced)
    
    # 이진화
    _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return binary

@app.route('/detect_plate', methods=['POST'])
def process_image():
    try:
        print("Request received") # 요청 수신 확인

        # 이미지 데이터 받기
        image_data = request.json['image']
        nparr = np.frombuffer(base64.b64decode(image_data.split(',')[1]), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 번호판 영역 검출
        plate_candidates = detect_plate_area(image)
        
        best_result = None
        highest_confidence = 0
        
        for box, area, angle in plate_candidates[:3]:  # 상위 3개 후보만 처리
            # 번호판 영역 추출 및 보정
            plate = preprocess_plate(image, box, angle)
            
            # 이미지 개선
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
                
                # 평균 신뢰도 계산
                conf_values = [int(x) for x in confidence['conf'] if x != '-1']
                if conf_values:
                    avg_confidence = sum(conf_values) / len(conf_values)
                    if avg_confidence > highest_confidence:
                        highest_confidence = avg_confidence
                        best_result = matches[0]
        
        if best_result:
            return jsonify({
                'success': True,
                'plate_number': best_result,
                'confidence': highest_confidence / 100
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