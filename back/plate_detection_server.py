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
from google.cloud import storage
import datetime


app = Flask(__name__)
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

def upload_debug_image(image, step_name):
    try:
        today_folder = datetime.datetime.now().strftime('%Y%m%d')
        timestamp = datetime.datetime.now().strftime('%H%M%S')

        filename = f"debug/{today_folder}/{timestamp}_{step_name}.jpg"
        
        client = storage.Client()
        bucket = client.bucket('eyemtaxi-bucket')
        blob = bucket.blob(filename)
        
        _, buffer = cv2.imencode('.jpg', image)
        blob.upload_from_string(buffer.tobytes(), content_type='image/jpeg')
        
        url = f"https://storage.googleapis.com/eyemtaxi-bucket/{filename}"
        logger.info(f"Debug image uploaded for {step_name}: {url}")
        return url
        
    except Exception as e:
        logger.error(f"Debug image upload failed: {str(e)}")
        return None
    
def detect_plate_area(image):
    height, width, channel = image.shape
    upload_debug_image(image, "1_original")

    # 1. 그레이스케일 변환
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # upload_debug_image(gray, "2_grayscale")

    # 2. 가우시안 블러
    img_blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 3. 이진화
    img_thresh = cv2.adaptiveThreshold(
        img_blur, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 19, 9
    )
    # upload_debug_image(img_thresh, "4_threshold")

    # Contour 시각화
    temp_result = np.zeros((height, width, channel), dtype=np.uint8)
    
    
    # 4. Contour 찾기
    contours, _ = cv2.findContours(
        img_thresh,
        mode=cv2.RETR_LIST,
        method=cv2.CHAIN_APPROX_SIMPLE
    )
    
    # 5. Contour 정보 저장
    temp_result = np.zeros((height, width, channel), dtype=np.uint8)
    contours_dict = []
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(temp_result, pt1=(x,y), pt2=(x+w, y+h), color=(255,255,255), thickness=2)
        
        contours_dict.append({
            'contour': contour,
            'x': x,
            'y': y,
            'w': w,
            'h': h,
            'cx': x + (w / 2),
            'cy': y + (h / 2)
        })
    
    # 6. 글자 크기로 후보 선정
    MIN_AREA = 150
    MIN_WIDTH, MIN_HEIGHT = 12, 20
    MIN_RATIO, MAX_RATIO = 0.2, 1.2
    
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

    for d in possible_contours:
        cv2.rectangle(temp_result, pt1=(d['x'], d['y']), 
                     pt2=(d['x']+d['w'], d['y']+d['h']), 
                     color=(255,255,255), thickness=2)
    upload_debug_image(temp_result, "6_contours")

    
    
    # 7. Contour 배열로 번호판 후보 선정
    def find_chars(contour_list):
        MAX_DIAG_MULTIPLYER = 3
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
    
    # 인접한 번호판 후보 영역 병합
    merged_results = []
    for i, r1 in enumerate(matched_result):
        x1_min = min(d['x'] for d in r1)
        x1_max = max(d['x'] + d['w'] for d in r1)
        y1_min = min(d['y'] for d in r1)
        y1_max = max(d['y'] + d['h'] for d in r1)
        
        merged = False
        for j, r2 in enumerate(merged_results):
            x2_min = min(d['x'] for d in r2)
            x2_max = max(d['x'] + d['w'] for d in r2)
            y2_min = min(d['y'] for d in r2)
            y2_max = max(d['y'] + d['h'] for d in r2)
            
            # 두 영역이 수평으로 가까이 있고 비슷한 높이에 있는지 확인
            x_distance = min(abs(x1_max - x2_min), abs(x2_max - x1_min))
            y_overlap = min(y1_max, y2_max) - max(y1_min, y2_min)
            height1 = y1_max - y1_min
            height2 = y2_max - y2_min
            
            # 병합 조건
            avg_char_width = np.mean([d['w'] for d in r1] + [d['w'] for d in r2])
            
            if (x_distance < 2 * avg_char_width and
                y_overlap > 0.5 * min(height1, height2) and
                abs(height1 - height2) < 0.3 * max(height1, height2)):
                
                # numpy array를 리스트로 변환하여 병합
                merged_contours = list(r2)
                merged_contours.extend(list(r1))
                merged_results[j] = np.array(merged_contours)
                merged = True
                break
        
        if not merged:
            merged_results.append(r1)

    # 8. 번호판 영역 추출
    plate_candidates = []
    debug_candidates = image.copy()

    for r in merged_results:
        # numpy array를 리스트로 처리
        r_list = list(r)
        # 번호판 영역의 좌표 계산
        x_min = min(d['x'] for d in r_list)
        x_max = max(d['x'] + d['w'] for d in r_list)
        y_min = min(d['y'] for d in r_list)
        y_max = max(d['y'] + d['h'] for d in r_list)

                # 번호판 비율 검사 (한국 택시 번호판 비율 520mm × 110mm ≈ 4.73:1)
        plate_width = x_max - x_min
        plate_height = y_max - y_min
        plate_ratio = plate_width / plate_height
        
        # 번호판 비율이 적절한 경우만 처리 (4.0 ~ 5.5 사이)
        if 4.0 <= plate_ratio <= 5.5:  # 카메라 각도나 왜곡을 고려하여 여유 있게 설정
            # 모든 후보 영역을 파란색으로 표시
            cv2.rectangle(debug_candidates, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)

            # 여백 추가 (택시 번호판 특성을 고려하여 조정)
            margin_x = int((x_max - x_min) * 0.05)  # 가로 5% 여백
            margin_y = int((y_max - y_min) * 0.3)   # 세로 30% 여백 (위아래 여유 확보)
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

    upload_debug_image(debug_candidates, "7_plate_detection")
    
    return sorted(plate_candidates, key=lambda x: x[1], reverse=True)

def preprocess_plate(image, box, angle):
    # 이미지 크기 계산
    width = int(max(np.linalg.norm(box[0] - box[1]),
                   np.linalg.norm(box[2] - box[3])))
    height = int(max(np.linalg.norm(box[0] - box[3]),
                    np.linalg.norm(box[1] - box[2])))
    
    src_pts = box.astype("float32")
    dst_pts = np.array([[0, 0],
                       [width-1, 0],
                       [width-1, height-1],
                       [0, height-1]], dtype="float32")
    
    # 투시 변환 행렬 계산 및 적용
    matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
    plate = cv2.warpPerspective(image, matrix, (width, height))
    
    # 텍스트 방향 감지를 위한 이진화
    gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 연결 요소 분석
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # 가장 큰 연결 요소의 방향 확인
        largest_contour = max(contours, key=cv2.contourArea)
        rect = cv2.minAreaRect(largest_contour)
        current_angle = rect[-1]
        
        # 각도 보정 (항상 수평이 되도록)
        if abs(current_angle) > 45:
            current_angle = 90 - abs(current_angle)
            if current_angle < 0:
                current_angle += 90
        elif abs(current_angle) > 85:  # 거의 수직인 경우
            current_angle = 0
            
        # 회전 적용
        if abs(current_angle) > 1:
            current_height, current_width = plate.shape[:2]
            center = (current_width // 2, current_height // 2)
            M = cv2.getRotationMatrix2D(center, current_angle, 1.0)
            plate = cv2.warpAffine(plate, M, (current_width, current_height),
                                 flags=cv2.INTER_CUBIC,
                                 borderMode=cv2.BORDER_REPLICATE)
            
            # 텍스트가 뒤집혔는지 확인
            gray_rotated = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
            upper_half = gray_rotated[:current_height//2, :]
            lower_half = gray_rotated[current_height//2:, :]
            
            if np.mean(upper_half) > np.mean(lower_half):
                # 이미지가 뒤집힌 경우 180도 회전
                plate = cv2.rotate(plate, cv2.ROTATE_180)
    
    return plate

def enhance_plate(plate):
    # 이미지 크기 확인 및 조정
    min_width = 200
    current_height, current_width = plate.shape[:2]
    
    if current_width < min_width:
        scale = min_width / current_width
        new_width = min_width
        new_height = int(current_height * scale)
        plate = cv2.resize(plate, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    
    # 이미지 전처리
    gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    denoised = cv2.fastNlMeansDenoising(enhanced)
    
    # 최종 방향 확인 및 보정
    height, width = denoised.shape[:2]  # 현재 이미지 크기 저장
    coords = np.column_stack(np.where(denoised > 0))
    if len(coords) > 0:
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        
        # 수직 이미지를 수평으로 회전
        if abs(angle) > 45:
            angle = 90 - abs(angle)
            if angle < 0:
                angle += 90
        
        # 회전 적용
        if abs(angle) > 1:
            center = (width // 2, height // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            denoised = cv2.warpAffine(denoised, M, (width, height),
                                    flags=cv2.INTER_CUBIC,
                                    borderMode=cv2.BORDER_REPLICATE)
            
            # 회전 후 텍스트가 뒤집혔는지 확인
            upper_half = denoised[:height//2, :]
            lower_half = denoised[height//2:, :]
            
            if np.mean(upper_half) > np.mean(lower_half):
                # 이미지가 뒤집힌 경우 180도 회전
                denoised = cv2.rotate(denoised, cv2.ROTATE_180)
    
    upload_debug_image(denoised, "8_plate_denoised")
    
    # Otsu's 이진화
    _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return binary

@app.route('/detect_plate', methods=['POST'])
def process_image():
    try:
        print("1번호판 인식 요청 받음")

        try:
            image_data = request.json['image']
            image_data = image_data.split(',')[1]
            logger.info("1.5번 이미지 디코딩 완료"+image_data)
            # base64 디코딩
            nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
            # 이미지 디코드
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("이미지 디코딩 실패")
                
            print(f"이미지 디코딩 완료 - 크기: {image.shape}")  # 이미지 정보 로깅
            
        except Exception as e:
            logger.error(f"이미지 디코딩 오류: {str(e)}")
            return jsonify({
                'success': False,
                'error': '이미지 디코딩 실패'
            })
        print("2번 이미지 디코딩 완료")

        # 번호판 영역 검출
        plate_candidates = detect_plate_area(image)
        print(f"3. 번호판 영역 검출 완료 - 후보 수: {len(plate_candidates)}")

        best_result = None
        highest_confidence = 0
        best_box = None  # 최적의 박스 좌표 저장용

        for box, area, angle in plate_candidates[:3]:
            try:
                print("5. 번호판 영역 추출 시작")
                plate = preprocess_plate(image, box, angle)
                
                if plate is None or plate.size == 0:
                    print("5-1. 유효하지 않은 번호판 이미지")
                    continue
                    
                enhanced_plate = enhance_plate(plate)
                print(f"6. 번호판 영역 보정 완료 - 크기: {enhanced_plate.shape}")

                if enhanced_plate is None or enhanced_plate.size == 0:
                    print("6-1. 이미지 처리 실패")
                    continue
                
                # OCR 실행 전 Tesseract 설정 확인
                tessdata_dir = os.environ.get('TESSDATA_PREFIX', '/usr/share/tesseract-ocr/tessdata')
                if not os.path.exists(os.path.join(tessdata_dir, 'kor.traineddata')):
                    print(f"한국어 데이터 파일이 없습니다. 경로: {tessdata_dir}/kor.traineddata")
                    print(f"현재 TESSDATA_PREFIX: {os.environ.get('TESSDATA_PREFIX')}")
                    print(f"사용 가능한 언어 파일들:")
                    os.system(f"ls -la {tessdata_dir}")
                
                print("7. OCR 수행 시작")
                plate_text = pytesseract.image_to_string(
                    enhanced_plate,
                    lang='kor',
                    config='--psm 7 --oem 3 -c tessedit_char_whitelist=0123456789가나다라마바사아자차카타파하'
                ).strip()

                if not plate_text:
                    print("7-1. OCR 결과 없음")
                    continue

                print(f"7-2. OCR 결과 (처음 20자): {plate_text[:20]}")
                
                plate_pattern = re.compile(r'\d{2,3}[가-힣]\d{4}')
                matches = plate_pattern.findall(plate_text)
                print(f"8. 정규식 검증 결과: {matches}")

                if matches:
                    print(f"9. 매칭된 번호판: {matches[0]}")
                    confidence_data = pytesseract.image_to_data(
                        enhanced_plate,
                        lang='kor',
                        config='--psm 7 --oem 3',
                        output_type=pytesseract.Output.DICT
                    )
                    
                    conf_values = [int(x) for x in confidence_data['conf'] if x != '-1']
                    if conf_values:
                        avg_confidence = sum(conf_values) / len(conf_values)
                        print(f"10. 평균 신뢰도: {avg_confidence:.2f}%")
                        
                        if avg_confidence > highest_confidence:
                            highest_confidence = avg_confidence
                            best_result = matches[0]
                            best_box = box
                            print(f"11. 새로운 최적 결과: {best_result} (신뢰도: {avg_confidence:.2f}%)")

            except Exception as e:
                print(f"번호판 처리 중 오류: {str(e)}")
                continue

        if best_result:
            print(f"13. 최적의 박스 좌표 저장: {best_box}")
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
            print(f"12. 최종 결과 - 번호판: {best_result}, 신뢰도: {highest_confidence:.2f}%")

            return jsonify({
                'success': True,
                'plate_number': best_result,
                'confidence': highest_confidence / 100,
                'plate_box': relative_box.tolist(),
                'debug_image': debug_image_base64
            })
        else:
            print("13. 번호판을 찾을 수 없음")
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
    app.run(host='0.0.0.0', port=5000, debug=True)  # host를 0.0.0.0으로 설정