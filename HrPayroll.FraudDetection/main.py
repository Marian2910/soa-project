import json
import os
import sys
from confluent_kafka import Consumer, KafkaError

# Configuration
KAFKA_BROKER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = 'audit-logs'

print(f"Starting Fraud Detector FaaS on {KAFKA_BROKER}...")

c = Consumer({
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'fraud-detection-group',
    'auto.offset.reset': 'earliest'
})

c.subscribe([TOPIC])

try:
    while True:
        msg = c.poll(1.0)

        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        try:
            data = json.loads(msg.value().decode('utf-8'))
            
            print(f"--- [FaaS TRIGGERED] ---")
            print(f"Event: {data.get('EventType')}")
            print(f"User: {data.get('UserId')}")
            print(f"New IBAN: {data.get('NewIban')}")
            
            iban = data.get('NewIban', '')
            if not iban.startswith('RO'):
                print("ALERT: Suspicious IBAN detected! (Non-Romanian)")
            else:
                print("IBAN format looks safe.")
            print("------------------------")
            
        except Exception as e:
            print(f"Error processing message: {e}")

except KeyboardInterrupt:
    pass
finally:
    c.close()