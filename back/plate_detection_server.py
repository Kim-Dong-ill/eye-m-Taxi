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
import re
import logging
from google.cloud import logging as cloud_logging


app = Flask(__name__)

# 최대 파일 크기 설정 (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# 허용되는 파일 확장자
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Cloud Logging 설정
client = cloud_logging.Client()
client.setup_logging()

# 로거 생성
logger = logging.getLogger('plate_detection')
logger.setLevel(logging.INFO)

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
pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

def detect_plate_area(image):
    # 1. 이미지 크기 정규화
    target_width = 1024
    height, width, channel = image.shape
    scale = target_width / width
    dim = (target_width, int(height * scale))
    image = cv2.resize(image, dim)
    
    # 2. 그레이스케일 변환 및 노이즈 제거
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 11, 17, 17)
    
    # 3. 가우시안 블러
    img_blur = cv2.GaussianBlur(denoised, (5, 5), 0)
    
    # 4. 이진화
    binary = cv2.adaptiveThreshold(
        img_blur,
        maxValue=255.0,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        thresholdType=cv2.THRESH_BINARY_INV,
        blockSize=19,
        C=9
    )
    
    # 5. Contour 찾기
    contours, _ = cv2.findContours(
        binary,
        mode=cv2.RETR_LIST,
        method=cv2.CHAIN_APPROX_SIMPLE
    )
    
    # 6. Contour 정보 저장
    temp_result = np.zeros((height, width, channel), dtype=np.uint8)
    contours_dict = []
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(temp_result, pt1=(x,y), pt2=(x+w, y+h), 
                     color=(255,255,255), thickness=2)
        
        contours_dict.append({
            'contour': contour,
            'x': x,
            'y': y,
            'w': w,
            'h': h,
            'cx': x + (w / 2),
            'cy': y + (h / 2)
        })
    
    # 7. 글자 크기로 후보 선정
    MIN_AREA = 80
    MIN_WIDTH, MIN_HEIGHT = 2, 8
    MIN_RATIO, MAX_RATIO = 0.25, 1.0
    
    possible_contours = []
    
    cnt = 0
    for d in contours_dict:
        area = d['w'] * d['h']
        ratio = d['w'] / d['h']
        
        if area > MIN_AREA \
        and d['w'] > MIN_WIDTH and d['h'] > MIN_HEIGHT \
        and MIN_RATIO < ratio < MAX_RATIO:
            d['idx'] = cnt
            cnt += 1
            possible_contours.append(d)
    
    # 8. Contour 배열로 번호판 후보 선정
    def find_chars(contour_list):
        MAX_DIAG_MULTIPLYER = 5
        MAX_ANGLE_DIFF = 12.0
        MAX_AREA_DIFF = 0.5
        MAX_WIDTH_DIFF = 0.8
        MAX_HEIGHT_DIFF = 0.2
        MIN_N_MATCHED = 3
        
        matched_result_idx = []
        
        for d1 in contour_list:
            matched_contours_idx = []
            for d2 in contour_list:
                if d1['idx'] == d2['idx']:
                    continue
                
                dx = abs(d1['cx'] - d2['cx'])
                dy = abs(d1['cy'] - d2['cy'])
                
                diagonal_length1 = np.sqrt(d1['w'] ** 2 + d1['h'] ** 2)
                
                distance = np.linalg.norm(np.array([d1['cx'], d1['cy']]) - np.array([d2['cx'], d2['cy']]))
                if dx == 0:
                    angle_diff = 90
                else:
                    angle_diff = np.degrees(np.arctan(dy / dx))
                    
                area_diff = abs(d1['w'] * d1['h'] - d2['w'] * d2['h']) / (d1['w'] * d1['h'])
                width_diff = abs(d1['w'] - d2['w']) / d1['w']
                height_diff = abs(d1['h'] - d2['h']) / d1['h']
                
                if distance < diagonal_length1 * MAX_DIAG_MULTIPLYER \
                and angle_diff < MAX_ANGLE_DIFF and area_diff < MAX_AREA_DIFF \
                and width_diff < MAX_WIDTH_DIFF and height_diff < MAX_HEIGHT_DIFF:
                    matched_contours_idx.append(d2['idx'])
                    
            matched_contours_idx.append(d1['idx'])
            
            if len(matched_contours_idx) < MIN_N_MATCHED:
                continue
                
            matched_result_idx.append(matched_contours_idx)
            
            unmatched_contour_idx = []
            for d4 in contour_list:
                if d4['idx'] not in matched_contours_idx:
                    unmatched_contour_idx.append(d4['idx'])
            
            if unmatched_contour_idx:
                unmatched_contour = np.take(possible_contours, unmatched_contour_idx)
                recursive_contour_list = find_chars(unmatched_contour)
                for idx in recursive_contour_list:
                    matched_result_idx.append(idx)
            
            break
            
        return matched_result_idx
    
    result_idx = find_chars(possible_contours)
    
    matched_result = []
    for idx_list in result_idx:
        matched_result.append(np.take(possible_contours, idx_list))
    
    # 9. 번호판 영역 추출
    plate_candidates = []
    
    for r in matched_result:
        # 번호판 영역의 좌표 계산
        x_min = min(d['x'] for d in r)
        x_max = max(d['x'] + d['w'] for d in r)
        y_min = min(d['y'] for d in r)
        y_max = max(d['y'] + d['h'] for d in r)
        
        # 여백 추가
        margin_x = int((x_max - x_min) * 0.1)
        margin_y = int((y_max - y_min) * 0.2)
        x_min = max(0, x_min - margin_x)
        x_max = min(width, x_max + margin_x)
        y_min = max(0, y_min - margin_y)
        y_max = min(height, y_max + margin_y)
        
        # 박스 좌표 생성
        box = np.array([
            [x_min, y_min],
            [x_max, y_min],
            [x_max, y_max],
            [x_min, y_max]
        ], dtype=np.int32)
        
        area = (x_max - x_min) * (y_max - y_min)
        angle = 0  # 수직 정렬된 번호판 가정
        
        plate_candidates.append((box, area, angle))
    
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

def enhance_plate(plate_img):
    # 이미지 크기 조정
    plate_img = cv2.resize(plate_img, dsize=(0, 0), fx=1.6, fy=1.6)
    
    # 이진화
    _, plate_img = cv2.threshold(plate_img, thresh=0.0, maxval=255.0, 
                               type=cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    
    # 노이즈 제거
    plate_img = cv2.GaussianBlur(plate_img, ksize=(3, 3), sigmaX=0)
    
    # 테두리 추가
    plate_img = cv2.copyMakeBorder(plate_img, top=10, bottom=10, 
                                 left=10, right=10, 
                                 borderType=cv2.BORDER_CONSTANT, 
                                 value=(0,0,0))
    
    return plate_img

@app.route('/detect_plate', methods=['POST'])
def process_image():
    try:
        # 1. 이미지 수신 및 디코딩
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': '이미지가 전송되지 않았습니다.'
            })
        file = request.files['image']
        
        if file and allowed_file(file.filename):
            # 파일 크기 검증 (8MB 제한)
            if len(file.read()) > 8 * 1024 * 1024:
                return jsonify({
                    'success': False,
                    'error': '파일 크기가 8MB를 초과합니다.'
                })
            
            # 파일 포인터를 다시 처음으로
            file.seek(0)
            
            # 이미지 처리
            npimg = np.fromfile(file, np.uint8)
            image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("이미지 디코딩 실패")
                
            # 이미지 크기 조정 (필요한 경우)
            max_dimension = 1024
            height, width = image.shape[:2]
            if max(height, width) > max_dimension:
                scale = max_dimension / max(height, width)
                image = cv2.resize(image, None, fx=scale, fy=scale)
        
        # 2. 번호판 영역 검출
        plate_candidates = detect_plate_area(image)
        print(f"번호판 영역 검출 완료 - 후보 수: {len(plate_candidates)}")
        
        best_result = None
        highest_confidence = 0
        best_box = None
        
        # 3. 각 후보 영역에 대해 OCR 수행
        for box, area, angle in plate_candidates[:3]:
            try:
                # 번호판 영역 추출
                x_min, y_min = np.min(box, axis=0)
                x_max, y_max = np.max(box, axis=0)
                plate = image[y_min:y_max, x_min:x_max]
                
                if plate is None or plate.size == 0:
                    continue
                
                # 그레이스케일 변환
                plate_gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
                
                # 이미지 개선
                enhanced_plate = enhance_plate(plate_gray)
                
                # OCR 수행
                plate_text = pytesseract.image_to_string(
                    enhanced_plate,
                    lang='kor',
                    config='--psm 7 --oem 3 -c tessedit_char_whitelist=0123456789가나다라마바사아자차카타파하'
                ).strip()
                
                # 번호판 패턴 검증
                result_chars = ''
                has_digit = False
                for c in plate_text:
                    if ord('가') <= ord(c) <= ord('힣') or c.isdigit():
                        if c.isdigit():
                            has_digit = True
                        result_chars += c
                
                if not has_digit or len(result_chars) < 7:
                    continue
                
                # 정규식 패턴 매칭
                plate_pattern = re.compile(r'\d{2,3}[가-힣]\d{4}')
                matches = plate_pattern.findall(result_chars)
                
                if matches:
                    # OCR 신뢰도 계산
                    confidence_data = pytesseract.image_to_data(
                        enhanced_plate,
                        lang='kor',
                        config='--psm 7 --oem 3',
                        output_type=pytesseract.Output.DICT
                    )
                    
                    conf_values = [int(x) for x in confidence_data['conf'] if x != '-1']
                    if conf_values:
                        avg_confidence = sum(conf_values) / len(conf_values)
                        
                        if avg_confidence > highest_confidence:
                            highest_confidence = avg_confidence
                            best_result = matches[0]
                            best_box = box
                
            except Exception as e:
                print(f"번호판 처리 중 오류: {str(e)}")
                continue
        
        # 4. 결과 반환
        if best_result:
            # 디버그 이미지 생성
            debug_result = image.copy()
            cv2.drawContours(debug_result, [best_box], 0, (0, 255, 0), 2)
            cv2.putText(debug_result, best_result, tuple(best_box[0]), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # 상대 좌표 변환
            height, width = image.shape[:2]
            relative_box = best_box.astype(float)
            relative_box[:, 0] = relative_box[:, 0] / width
            relative_box[:, 1] = relative_box[:, 1] / height
            
            # 디버그 이미지 인코딩
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
        print(f"전체 처리 중 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("Starting plate detection server...")
    app.run(host='0.0.0.0', port=5000, debug=True)