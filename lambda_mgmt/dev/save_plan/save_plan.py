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

from ..dynamo_interaction import dynamoInteraction
# from .data_science import optimizer # cannot import cvxpy nor can it be pip installed on my system

# from . import example_model

def lambda_handler(event, context):
    # connect to the dynamo db
    print('connecting to database')
    dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")
    plan_inputs_table = dynamodb.Table('plan_inputs_local')
    saved_plans_table = dynamodb.Table('saved_plans_local')
    print('connected to database')

    print('retrieving from the inputs table to save')
    res = {}
    status = 200

    print('------------------------------')
    print('')
    print(event)
    print('')
    print('------------------------------')
    
    res_plan = plan_inputs_table.query(
        KeyConditionExpression=Key('id').eq(event['plan_inputs_id'])
    )
    # res_plan = plan_inputs_table.query(
    #     KeyConditionExpression=Key('id').eq(event['plan_inputs_id'])
    # )
    if res_plan['Count'] > 0:

        checkSaveExists = saved_plans_table.scan(
            FilterExpression=Key('plan_inputs_id').eq(event['plan_inputs_id'])
        )
        print('------------------------------')
        print('')
        print(checkSaveExists)
        print('')
        print('------------------------------')
        
        if checkSaveExists['Count'] == 0:
            # print(res_plan)
            put_data = res_plan['Items'][0]

            put_data['title'] = event['title']
            put_data['created'] = event['created']
            put_data['created_by'] = event['created_by']
            put_data['modified'] = event['modified']
            put_data['plan_inputs_id'] = event['plan_inputs_id']

            # create the uuid
            _id = uuid.uuid1()
            put_data['id'] = str(_id)

            # # push the plan into the table
            print('--- save placeholder')
            res = saved_plans_table.put_item(
                Item=put_data
            )
        else:
            print('plan already exists')
            body = 'that plan is already saved in the database'

            res['body'] = body
            status = 208

    print('done - returning to front-end')

    return {
        'statusCode': status,
        'body': res,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    }