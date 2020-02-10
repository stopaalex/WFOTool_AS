

import boto3
from boto3.dynamodb.conditions import Key, Attr
import json


def insertData():

    event = {}

    with open('defaultData.json') as jsonFile:
        event = json.load(jsonFile)

    dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")
    default_data_table = dynamodb.Table('default_inputs_local')

    put_data = convert_to_dynamo(event)

    res = default_data_table.put_item(
        Item=put_data
    )

    resCheck = default_data_table.query(
        KeyConditionExpression=Key('id').eq('61761d46-06ed-11ea-bfb8-d8f2ca4be654')
    )

    if resCheck.Count == 1:
        print('  ')
        print(' default data inserted properly')
        print('creating the remaining tables...')
        print('  ')

def convert_to_dynamo(data):

    converted_data = {}

    # --- Loop through the highest level
    for i in data:
        # if the data is a string, create the object and put the data to a string
        # if it's not a string then we gotta loop again
        # this method is then repeated foro every subsequet loop
        if type(data[i]) is str:
            converted_data[i] = str(data[i])
        else:
            converted_data[i] = {}
            for j in data[i]:
                if type(data[i][j]) is str:
                    converted_data[i][j] = str(data[i][j])
                elif type(data[i][j]) is list:
                    count = 0
                    converted_data[i][j] = []
                    for x in data[i][j]:
                        lo = {}
                        for y in data[i][j][count]:
                            lo[y] = str(data[i][j][count][y])
                        count += 1
                        converted_data[i][j].append(lo)
                elif type(data[i][j]) is dict:
                    converted_data[i][j] = {}
                    for k in data[i][j]:
                        if type(data[i][j][k]) is str:
                            converted_data[i][j][k] = str(data[i][j][k])
                        elif type(data[i][j][k]) is int:
                            converted_data[i][j][k] = str(data[i][j][k])
                        elif type(data[i][j][k]) is float:
                            converted_data[i][j][k] = str(data[i][j][k])

    return converted_data



if __name__ == '__main__':
    insertData()