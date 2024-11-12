from kafka import KafkaConsumer, KafkaProducer
import pandas as pd
import glob
import os
import json

# Function to map the structure of a given DataFrame to the common schema
def MapToCommonSchema(DF):
    CommonSchema = {
        'type': None,
        'postTitle': None,
        'postDesc': None,
        'postTime': None,
        'authorName': None,
        'noOfUpvotes': None,
        'isNSFW': None,
        'comments': None,
        'noOfComments': None,
        'imageUrl': None,
        'postUrl': None,
        'subReddit': None
    }

    if 'type' in DF.columns:
        CommonSchema['type'] = DF['type']
    if 'postTitle' in DF.columns:
        CommonSchema['postTitle'] = DF['postTitle']
    if 'postDesc' in DF.columns:
        CommonSchema['postDesc'] = DF['postDesc']
    if 'postTime' in DF.columns:
        CommonSchema['postTime'] = DF['postTime']
    if 'authorName' in DF.columns:
        CommonSchema['authorName'] = DF['authorName']
    if 'noOfUpvotes' in DF.columns:
        CommonSchema['noOfUpvotes'] = DF['noOfUpvotes']
    if 'isNSFW' in DF.columns:
        CommonSchema['isNSFW'] = DF['isNSFW']
    if 'comments' in DF.columns:
        CommonSchema['comments'] = DF['comments']
    elif all(x in DF.columns for x in ['comment1', 'comment2', 'comment3']):
        CommonSchema['comments'] = DF[['comment1', 'comment2', 'comment3']].apply(lambda row: [x for x in row if pd.notna(x)], axis=1)
    if 'noOfComments' in DF.columns:
        CommonSchema['noOfComments'] = DF['noOfComments']
    if 'imageUrl' in DF.columns:
        CommonSchema['imageUrl'] = DF['imageUrl']
    if 'postUrl' in DF.columns:
        CommonSchema['postUrl'] = DF['postUrl']
    if 'subReddit' in DF.columns:
        CommonSchema['subReddit'] = DF['subReddit']

    return pd.DataFrame(CommonSchema)

def main():
    # Configure the consumer
    consumer = KafkaConsumer(
        'fyp',  # Kafka topic
        bootstrap_servers='localhost:9092',
        group_id='my-group',
        value_deserializer=lambda x: x.decode('utf-8'),
        auto_offset_reset='earliest',
        enable_auto_commit=True
    )

    # Configure the producer
    producer = KafkaProducer(
        bootstrap_servers='localhost:9092',
        value_serializer=lambda v: v.encode('utf-8')  # Encode strings as bytes
    )

    # Directory containing the CSV files
    dir_path = '/home/fasih/Final Year Project/data-tails/Backend/data/uni_pc/'
    files = glob.glob(os.path.join(dir_path, '*.csv'))

    processed_records = set()  # To keep track of unique records

    for file in files:
        try:
            df = pd.read_csv(file)
            mapped_df = MapToCommonSchema(df)  # Map to common schema
            records = mapped_df.to_dict(orient='records')

            for record in records:
                record_id = (record['postUrl'], record['postTime'], record['noOfComments'])
                if record_id not in processed_records:
                    processed_records.add(record_id)
                    message = json.dumps(record)  # Convert to JSON string
                    future = producer.send('fyp', message)
                    future.get(timeout=10)  # Wait for confirmation
                    print(f'Sent record to producer: {record}')
                else:
                    print(f"Duplicate record found and skipped: {record['postUrl']} at {record['postTime']} with {record['noOfComments']} comments")

        except Exception as e:
            print(f"Error processing file {file}: {e}")

    # Clean up
    producer.close()
    consumer.close()

if __name__ == '__main__':
    main()