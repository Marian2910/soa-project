import json
import os
import sys
import re
import time
from datetime import datetime
from confluent_kafka import Consumer, Producer, KafkaError

KAFKA_BROKER = os.getenv('KAFKA_BOOTSTRAP_SERVERS')
TOPIC = 'audit-logs'

print(f"Starting Fraud Detector FaaS on {KAFKA_BROKER}...")

c = Consumer({
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'fraud-detection-group',
    'auto.offset.reset': 'earliest'
})

p = Producer({'bootstrap.servers': KAFKA_BROKER})

c.subscribe([TOPIC])

def delivery_report(err, msg):
    if err is not None:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Fraud Alert published to {msg.topic()}")

def validate_ro_iban(iban: str) -> bool:
    if not iban:
        return False

    iban = iban.replace(' ', '').upper()

    if not iban.startswith('RO'):
        return False

    if len(iban) != 24:
        return False

    if not re.match(r'^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$', iban):
        return False

    rearranged = iban[4:] + iban[:4]
    numeric = ""

    for ch in rearranged:
        if ch.isdigit():
            numeric += ch
        else:
            numeric += str(ord(ch) - 55)

    remainder = 0
    for i in range(0, len(numeric), 7):
        remainder = int(str(remainder) + numeric[i:i + 7]) % 97

    return remainder == 1

try:
    while True:
        msg = c.poll(1.0)

        if msg is None:
            continue
        if msg.error():
            if msg.error().code() != KafkaError._PARTITION_EOF:
                print(f"Consumer error: {msg.error()}")
            continue

        try:
            data = json.loads(msg.value().decode('utf-8'))
            
            if data.get('EventType') == 'IBAN_UPDATED':
                print(f"--- [FaaS TRIGGERED] ---")
                print(f"Event: {data.get('EventType')}")
                print(f"User: {data.get('UserId')}")
                
                iban = data.get('NewIban', '')
                print(f"Analyzing: {iban}")

                if not validate_ro_iban(iban):
                    print("ALERT: Suspicious or invalid Romanian IBAN detected!")
                    
                    alert_payload = {
                        "EventType": "FRAUD_DETECTED",
                        "UserId": data.get('UserId'),
                        "Details": f"Suspicious/Invalid IBAN detected: {iban}",
                        "Timestamp": datetime.utcnow().isoformat()
                    }
                    
                    p.produce(TOPIC, json.dumps(alert_payload).encode('utf-8'), callback=delivery_report)
                    p.flush()
                else:
                    print("IBAN is a valid Romanian IBAN.")

                print("------------------------")

        except Exception as e:
            print(f"Error processing message: {e}")

except KeyboardInterrupt:
    pass
finally:
    c.close()