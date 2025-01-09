FROM python:3.9-slim

# Tesseract 설치
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-kor \
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

# 서버 실행
CMD exec gunicorn --bind :$PORT plate_detection_server:app