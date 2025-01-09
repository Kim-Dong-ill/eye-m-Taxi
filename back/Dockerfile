FROM python:3.9-slim

# 시스템 패키지 설치 (OpenCV 의존성 추가)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-kor \
    libgl1-mesa-glx \  # OpenCV 의존성
    libglib2.0-0 \     # OpenCV 의존성
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV TESSERACT_PATH=/usr/bin/tesseract
ENV PYTHONUNBUFFERED=1

# 서버 실행
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 plate_detection_server:app