'''

creating a local server to listen to http calls

astopa

'''

from flask import Flask, request, json, jsonify
from flask_cors import CORS
import simplejson

# import the "lambdas"
from lambda_mgmt.dev.run_plan import run_plan
from lambda_mgmt.dev.save_plan import save_plan
from lambda_mgmt.dev.get_default_inputs import get_default_inputs
from lambda_mgmt.dev.get_inputs import get_inputs_by_id
from lambda_mgmt.dev.get_saved_plans import get_saved_plans
from lambda_mgmt.dev.get_outputs import get_outputs_by_input_id

app = Flask(__name__)
CORS(app)

@app.route("/run-plan", methods=['POST'])
def def_test_route():
    print('-----------------------------------------------------------')
    print('starting local server scripts ::: run-plan')

    d = json.loads(request.get_data().decode('utf8'))
    x = run_plan.lambda_handler(d, None)

    print('-----------------------------------------------------------')
    return jsonify(x)


@app.route("/save-plan", methods=['POST'])
def def_save_plan():
    print('-----------------------------------------------------------')
    print('starting local server scripts ::: save-plan')

    d = json.loads(request.get_data().decode('utf8'))
    x = save_plan.lambda_handler(d, None)

    print('-----------------------------------------------------------')
    return jsonify(x)


@app.route("/get-default-inputs", methods=['GET'])
def def_get_default_inputs():
    print('-----------------------------------------------------------')
    print('---starting local server scripts ::: get-default-inputs----')

    default_id = request.args.get('id')
    x = get_default_inputs.lambda_handler({'id':default_id}, None)

    print('-----------------------------------------------------------')
    return jsonify(x)

@app.route("/get-inputs-by-id", methods=['GET'])
def def_get_inputs_by_id():
    print('-----------------------------------------------------------')
    print('---starting local server scripts ::: get-inputs-by-id----')

    input_id = request.args.get('id')
    t = get_inputs_by_id.lambda_handler({'id':input_id}, None)

    print('-----------------------------------------------------------')
    return jsonify(t)

@app.route("/get-saved-plans", methods=['GET'])
def def_get_saved_plans():
    print('-----------------------------------------------------------')
    print('---starting local server scripts ::: get-saved-plans----')

    t = get_saved_plans.lambda_handler({'data': 'empty'}, None)

    print('-----------------------------------------------------------')
    return jsonify(t)

@app.route("/get-output-plans", methods=['GET'])
def def_get_outputs_by_input_id():
    print('-----------------------------------------------------------')
    print('---starting local server scripts ::: get-outputs-by-inputs-id----')

    t = get_outputs_by_input_id.lambda_handler({'plan_inputs_id': request.args.get('plan_inputs_id')}, None)

    print('-----------------------------------------------------------')
    print(t)
    return jsonify(t)

if __name__ == "__main__":
    app.run(host="localhost", port="1000", debug=True)