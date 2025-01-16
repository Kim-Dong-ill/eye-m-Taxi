FROM python:3.9-slim

# 시스템 패키지 설치 (OpenCV 의존성 추가)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-kor \
    libgl1-mesa-glx \
    libglib2.0-0 \
    wget \  
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Tesseract 설정
ENV TESSERACT_PATH=/usr/bin/tesseract
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/tessdata

# 한국어 데이터 파일 수동 다운로드 (기존 파일이 없는 경우를 대비)
RUN wget https://github.com/tesseract-ocr/tessdata/raw/main/kor.traineddata -P /usr/share/tesseract-ocr/tessdata/

# 한국어 데이터 파일 확인
RUN ls -la /usr/share/tesseract-ocr/tessdata/kor.traineddata || echo "한국어 데이터 파일 없음"

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 서버 실행
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 plate_detection_server:app