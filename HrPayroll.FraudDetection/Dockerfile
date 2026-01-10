FROM python:3.9-slim

WORKDIR /app

RUN pip install confluent-kafka

COPY main.py .

CMD ["python", "-u", "main.py"]