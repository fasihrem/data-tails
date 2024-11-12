from kafka import KafkaProducer
from kafka import KafkaConsumer
from pymongo import MongoClient
import json

def MongoDBConnection():
    uri = "mongodb://localhost:27017"
    client = MongoClient(uri)
    db = client['Data-Tails']
    collection = db['RedditData']
    return collection

def insert_records_to_mongodb(collection, records):
    for record in records:
        query = {
            'postUrl': record['postUrl'],
            'postTime': record['postTime'],
            'noOfComments': record['noOfComments']
        }
        if collection.count_documents(query, limit=1) == 0:
            collection.insert_one(record)
            print(f"Inserted record: {record['postUrl']}")
        else:
            print(f"Duplicate record found in MongoDB: {record['postUrl']}")

def main():
    # Configure the consumer
    consumer = KafkaConsumer(
        'fyp',  # Kafka topic
        bootstrap_servers='localhost:9092',
        group_id='my-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))  # Deserialize JSON
    )

    collection = MongoDBConnection()

    try:
        for message in consumer:
            record = message.value
            insert_records_to_mongodb(collection, [record])  # Insert each record
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()

if __name__ == '__main__':
    main()
