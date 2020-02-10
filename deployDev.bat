@echo off

echo.
echo --- Building and deploying dev "->" dev_cloud "->" aws dev environment
echo.

echo.
echo --- build front-end
CALL gulp build_dev

echo.
echo --- build back end
CALL gulp build_dev_lambda

echo.
echo --- deploy back end to aws
CALL aws s3 cp lambda_mgmt/dev_cloud s3://dev-wfo-lambda-code --recursive

echo.
echo --- updating lambda functions
CALL aws lambda update-function-code --function-name WFO_dev_s3_get_default_inputs --s3-bucket dev-wfo-lambda-code --s3-key get_default_inputs/get_default_inputs.zip
CALL aws lambda update-function-code --function-name WFO_dev_s3_get_inputs --s3-bucket dev-wfo-lambda-code --s3-key get_inputs/get_inputs.zip
CALL aws lambda update-function-code --function-name WFO_dev_s3_get_outputs --s3-bucket dev-wfo-lambda-code --s3-key get_outputs/get_outputs.zip
CALL aws lambda update-function-code --function-name WFO_dev_s3_run_plan --s3-bucket dev-wfo-lambda-code --s3-key run_plan/run_plan.zip
CALL aws lambda update-function-code --function-name WFO_dev_s3_save_plan --s3-bucket dev-wfo-lambda-code --s3-key save_plan/save_plan.zip

echo.
echo --- back end code deployed and updated

echo.
echo --- deploying front-end
CALL aws s3 cp WFOTool_ui/src/dev_cloud s3://dev-wfo-bucket --recursive


 cmd /k