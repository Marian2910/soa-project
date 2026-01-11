import json
import os
import sys
import re
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


def validate_ro_iban(iban: str) -> bool:
    if not iban:
        return False

    iban = iban.replace(' ', '').upper()

    # Must be Romanian
    if not iban.startswith('RO'):
        return False

    # Romanian IBAN length is always 24
    if len(iban) != 24:
        return False

    # ROkk BBBB CCCC CCCC CCCC CCCC
    if not re.match(r'^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$', iban):
        return False

    # MOD-97 checksum
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

            print(f"--- [FaaS TRIGGERED] ---")
            print(f"Event: {data.get('EventType')}")
            print(f"User: {data.get('UserId')}")
            print(f"New IBAN: {data.get('NewIban')}")

            iban = data.get('NewIban', '')

            if not validate_ro_iban(iban):
                print("ALERT: Suspicious or invalid Romanian IBAN detected!")
            else:
                print("IBAN is a valid Romanian IBAN.")

            print("------------------------")

        except Exception as e:
            print(f"Error processing message: {e}")

except KeyboardInterrupt:
    pass
finally:
    c.close()
