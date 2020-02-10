

echo off

SET TABLES= default_inputs_local plan_inputs_local plan_outputs_local saved_plans_local

(for %%a in (%TABLES%) do (
    echo.
    echo - creating table : %%a
    CALL aws dynamodb create-table --table-name %%a --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --endpoint-url http://localhost:8000
))

CALL python insertDefaultData.py

echo.
echo END

CMD /k