# === this will be the router and the main entry point for the API Gateway

# === thinking that the model files could also live here?

'''
to test this router, you must run the following command in the command line

-----
python router.py <your test data json file>
-----

'''

import boto3
from boto3.dynamodb.conditions import Key, Attr
import uuid


# import lambda_mgmt.dev.convert_to_dynamo as ctd

import dynamoInteraction
# from .data_science import optimizer # cannot import cvxpy nor can it be pip installed on my system

# import example_model

def lambda_handler(event, context):
    # connect to the dynamo db
    print('connecting to database')
    dynamodb = boto3.resource('dynamodb')
    plan_inputs_table = dynamodb.Table('plan_inputs')
    plan_outputs_table = dynamodb.Table('plan_outputs')
    print('connected to database')

    status = 200
    res = None

    outputs = plan_outputs_table.scan(
            FilterExpression=Key('plan_inputs_id').eq(event['plan_inputs_id'])
        )

    print(outputs)

    if outputs.get('Count') > 1:
        res['body'] = 'More than one output exists, there is an error in the data'
        status = 500
    else:
        res = outputs


    # print(res)
    print('done - returning to front-end')

    return {
        'statusCode': status,
        'body': res,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    }