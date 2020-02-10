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
# import the optimizer
import optimizer

# import example_model

def lambda_handler(event, context):
    # connect to the dynamo db
    print('connecting to database')
    dynamodb = boto3.resource('dynamodb')
    plan_inputs_table = dynamodb.Table('plan_inputs')
    plan_outputs_table = dynamodb.Table('plan_outputs')
    print('connected to database')

    # if the plan was sent in with an id, we'll need to check to see if it exists, and if it does, then create a new id for it
    print('checking if plan has been run')
    count = 0;
    for k in event:
        if k == 'id':
            count += 1
    print('Count: ')
    print(count)

    if count > 0:
        _id = event['id']
        res = plan_inputs_table.query(
            KeyConditionExpression=Key('id').eq(event['id'])
        )
        if res['Count'] == 0:
            print('you have an id, but it is not showing in the db')
            put_data = dynamoInteraction.convert_to_dynamo(event)
            # create the uuid
            # _id = uuid.uuid1()
            # put_data['id'] = str(_id)
            # print('    ' + str(_id))
            # push the plan into the table
            res = plan_inputs_table.put_item(
                Item=put_data
            )
            print('item saved to the db')

        print('a plan with this id already exists... ')
        print('    ' + event['id'])
    else:
        # === convert the data to the dynamo format
        print('this plan doesn not exists, push it into the database')
        put_data = dynamoInteraction.convert_to_dynamo(event)
        # create the uuid
        _id = uuid.uuid1()
        put_data['id'] = str(_id)
        print('    ' + str(_id))
        # push the plan into the table
        res = plan_inputs_table.put_item(
            Item=put_data
        )
        print('saved to the database')
    # res = dynamodb.Table('default_inputs').put_item(
    #     Item=put_data
    # )
    # 
    # 
    status = 200
    # --- if the put to the plan-inputs is successful, run the optimizer and save the the ouputs
    # print(res)
    if res['ResponseMetadata']['HTTPStatusCode'] == 200:
        status = 200
        print('run the optimization')
        # --- crerate the outputs id and stringify the id
        output_id = str(uuid.uuid1())
        _id = str(_id)
        # 
        # run the science shit here

        try:
            res = optimizer.run_optimizer(event, output_id, _id)
            print('------- output of optimizer')
            print(res)
            
            checkExists = plan_outputs_table.scan(
                FilterExpression=Key('plan_inputs_id').eq(_id)
            )

            output_put_data = dynamoInteraction.convert_output_to_dynamo(res)
            
            print('------- output put data')
            print(output_put_data)

            if checkExists.get('Count') == 0:
                # print(' | output print placeholder for put statement')
                res_put = plan_outputs_table.put_item(
                    Item=output_put_data
                )
                print('-------- output of push')
                print(res_put)
            else:
                print('plan already exists')
            # will need to return the actual optimized data return as well as append the id from the response
            print('optimization run')

            # --- check for NaN in the output so we can save ourselves
            for x in res['summary_metrics']:
                if str(res['summary_metrics'][x]).lower() == 'nan':
                    res['summary_metrics'][x] = str(res['summary_metrics'][x])
                    status = 418

        except Exception as e:
            res = 'error'
            print('error running optimization')
            print(e)
            res = 'There was an error running this plan... please try again'
            status = 500

        # --- when optimization works we don't need to do this here anymore
        # res = fakeReturn
    else:
        status = 500
        res = 'There was an error running this plan... please try again'


    print(res)
    print('done - returning to front-end')

    return {
        'statusCode': status,
        'body': res,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        }
    }