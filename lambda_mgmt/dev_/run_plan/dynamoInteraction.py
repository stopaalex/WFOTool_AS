'''

    astopa

    dynamo interaction file

'''

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


def convert_from_dynamo(data):
    print('converting---------------------------')

    converted_data = {}

    for i in data:
        if type(data[i]) is str:
            converted_data[i] = data[i]
        else:
            converted_data[i] = {}
            for j in data[i]:
                if type(data[i][j]) is str:
                    converted_data[i][j] = data[i][j]

                elif type(data[i][j]) is list:
                    count = 0
                    converted_data[i][j] = []
                    for x in data[i][j]:
                        lo = {}
                        for y in data[i][j][count]:
                            try:
                                a = int(data[i][j][count][y])
                                lo[y] = a
                            except Exception as a:
                                lo[y] = data[i][j][count][y]
                        count += 1
                        converted_data[i][j].append(lo)

                elif type(data[i][j]) is dict:
                    converted_data[i][j] = {}
                    for k in data[i][j]:
                        try:
                            a = int(data[i][j][k])
                            converted_data[i][j][k] = a
                        except Exception as a:
                            try:
                                b = float(data[i][j][k])
                                converted_data[i][j][k] = b
                            except Exception as b:
                                converted_data[i][j][k] = data[i][j][k]

    return converted_data

def convert_output_to_dynamo(data):
    print('-------------------- converting')
    # print(data)
    
    converted_data = {}
    for i in data:
        if type(data[i]) is str:
            converted_data[i] = data[i]
        elif type(data[i]) is dict:
            # print('     type:')
            # print(type(data[i]))
            converted_data[i] = {}
            for j in data[i]:
                # print(str(type(data[i][j])))
                # print(data[i][j])
                if type(data[i][j]) is int:
                    converted_data[i][j] = str(data[i][j])
                    # --- type  is bumpy.float?
                    # --- string it? I actually don't know what to do here
                elif type(data[i][j]) is float:
                    converted_data[i][j] = str(data[i][j])
                elif str(type(data[i][j])) == "<class 'numpy.float64'>":
                    converted_data[i][j] = str(data[i][j])
                elif type(data[i][j]) is dict:
                    for k in data[i][j]:
                        converted_data[i][j][k] = str(data[i][j][k])
                else:
                    print('oh fuck')  
                    # TODO || type is returning error because of NaN
                    # FIXME || plz
            print(converted_data[i])
        else:
            # print(data[i])
            rowCount = 0
            headers = []
            converted_data[i] = []

            for row in data[i]:
                # print(row)
                if rowCount == 0:
                    headers = row
                else:
                    rowObject = {}
                    colCount = 0
                    for col in data[i][rowCount]:
                        rowObject[headers[colCount]] = str(data[i][rowCount][colCount])
                    converted_data[i].append(rowObject)
                rowCount += 1

    print('--- end of dynamo converstion')
    print(converted_data)
    return converted_data