
'''

    astopa

    retrieve_inputs

'''

import boto3
from boto3.dynamodb.conditions import Key, Attr
import json

import dynamoInteraction

def lambda_handler(event, context):

    # set the parameter from the event data
    # inputs_id = event['id']
    # inputs_id = '71158858-0592-11ea-896c-d8f2ca4be654'

    # connect to the dynamo db
    dynamodb = boto3.resource('dynamodb')
    plan_inputs_table = dynamodb.Table('saved_plans')

    # query the table for the default data
    saved_plans = plan_inputs_table.scan()
    # default_data = plan_inputs_table.query(
    #     KeyConditionExpression=Key('id').eq(inputs_id)
    # )

    # data = json.dumps(default_data)
    count = 0
    for x in saved_plans['Items']:
        # print(x)
        saved_plans['Items'][count] = dynamoInteraction.convert_from_dynamo(saved_plans['Items'][count])
        count += 1

    d = saved_plans
    # d = dynamoInteraction.convert_from_dynamo(saved_plans['Items'][0])
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