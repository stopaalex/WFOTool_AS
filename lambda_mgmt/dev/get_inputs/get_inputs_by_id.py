
'''

    astopa

    retrieve_inputs

'''

import boto3
from boto3.dynamodb.conditions import Key, Attr
import json

from ..dynamo_interaction import dynamoInteraction

def lambda_handler(event, context):

    # set the parameter from the event data
    inputs_id = event['id']
    # inputs_id = '71158858-0592-11ea-896c-d8f2ca4be654'
    # --- test push

    # connect to the dynamo db
    dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")
    plan_inputs_table = dynamodb.Table('plan_inputs_local')

    # query the table for the default data
    default_data = plan_inputs_table.query(
        KeyConditionExpression=Key('id').eq(inputs_id)
    )

    # data = json.dumps(default_data)
    d = dynamoInteraction.convert_from_dynamo(default_data['Items'][0])
    # print('data transformed from dynamo: ')

    # data = str(d).replace("'", '"').replace('None', 'null')
    # print(json.dumps(d))

    return {
        'statusCode': 200,
        'body': d,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    }