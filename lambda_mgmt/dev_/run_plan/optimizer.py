import json
import numpy as np
import numpy.matlib
import cvxpy as cp

## IMPORT AND RUN THIS FUNCTION ##

def run_optimizer(event, output_id, _id):
    # Get clean inputs for optimizePlan
    (t, f, d, b, a, S, H, cmin, cmax, Rmin, Rmax, case_list, worker_list) = _read_event(event)
    
    cases = optimizePlan(t, f, d, b, a, S, H, cmin, cmax, Rmin, Rmax)
    cases = np.rint(cases).astype(int) #round to nearest integer
    
    # Store results/metrics in dictionaries  
    cases_attempted = cases.tolist(), 
    cases_succeeded = np.multiply(cases, S).tolist(),
    cases_revenue = np.multiply(
        np.multiply(cases, S),     # Element-wise multiply cases with success rate
        np.matmul(                 # Matrix multiply to repeat d across columns
            d.reshape((len(d), 1)), # Dollars per case transposed
            np.ones((1, len(f)))    # Column vector of ones
        )
    )
    cases_cost = np.multiply(
        np.multiply(cases, H),     # Element-wise multiply cases with hours per case
        np.matmul(                 # Matrix multiply to repeat b across rows
            np.ones((len(d), 1)),  # Column vector of ones
            b.reshape((1, len(b))) # Dollars per case transposed  
        )
    )
    plan_details = cases.T.astype(object)
    case_type_total = np.sum(plan_details, axis=0)
    worker_type_total = np.sum(plan_details, axis=1)
    
    ## Creating output dictionary
    
    # prep for plan_details list
    header = ['Plan Details', *case_list, 'Total']
    
    #np.concatenate((plan_details, np.reshape(case_type_total, (1, len(case_type_total)))), axis=0)
    middle = np.concatenate((plan_details, np.reshape(worker_type_total, (len(worker_type_total),1)) ), axis=1)#.tolist()
    middle_labels = np.reshape(np.array(worker_list), (len(worker_list),1))
    middle = np.concatenate((middle_labels,middle),axis=1).tolist()
    
    total_row = np.reshape(case_type_total, (1, len(case_type_total))).flatten().tolist()
    total_row.insert(0, 'Total')
    
    plan_details_list = [header, *middle, total_row]
    
    outputReturn = {
        'id': output_id,
        'plan_inputs_id': _id,
        'summary_metrics': {
            'revenue': np.sum(cases_revenue),
            'cost': np.sum(cases_cost),
            'roi_percent': np.round(((np.sum(cases_revenue)-np.sum(cases_cost))/np.sum(cases_cost))*100, decimals=2),
            'success_rate': np.round(np.divide(np.sum(cases_succeeded), np.sum(cases_attempted)) * 100, decimals = 2)
        },
        'plan_details': plan_details_list
    }
    
    return outputReturn

## HELPER FUNCTIONS ##

# Function to run the optimization
def optimizePlan(t, f, d, b, a, S, H, cmin, cmax, Rmin, Rmax):
    
    ###########################################################################
    # PROBLEM OVERVIEW:
    #
    # Maximize Total Revenue
    #  sum_ij { (C_ij * d_i * S_ij) - (b_j * H_ij * C_ij) }
    #
    # where:
    #  n = # of case types, i = 1, ..., n
    #  m = # of worker types, j = 1, ..., m
    #  t = Hours per FTE
    #  d_i = $ per case (revenue) for case type i
    #  b_j = $ burn rate per hour for worker type j
    #  f_j = FTE for worker type j
    #  a_i = Available inventory for case type i
    #  S_ij = Success rate (percentage) for case type i by worker type j
    #  H_ij = Hours per case for case type i by worker type j
    #  cmin_i = Minimum case volume allowed for case type i
    #  cmax_i = Maximum case volume allowed for case type i
    #  Rmin_ij = Minimum percent worked by worker type j on case type i
    #  Rmax_ij = Maximum percent worked by worker type j on case type i
    #
    # with decision variable:
    #  C_ij = # of cases for case type i by worker type j
    #
    # subject to:
    # (1) Hours constraint
    #  sum_i { C_ij * H_ij } <= t * f_j, for all j
    #
    # (2) Inventory constraint
    #  sum_j { C_ij } <= a_i, for all i
    #
    # (3) Case volume floor and ceiling constraints
    #  sum_j { C_ij } <= cmax_i, for all i
    #  sum_j { C_ij } >= cmin_i, for all i
    # 
    # (4) Resource flexibility floor and ceiling constraints
    #  (C_ij * H_ij) <= Rmax_ij * sum_i {C_ij * H_ij}, for all i and j
    #  (C_ij * H_ij) >= Rmin_ij * sum_i {C_ij * H_ij}, for all i and j
    #
    # (5) Non-negative case counts
    #  C_ij >= 0
    #
    # (6) Case counts are integers
    ###########################################################################
    

    
    # Get shape of inputs (using H arbitrarily)
    n = H.shape[0] # Number of case types
    m = H.shape[1] # Number of worker types
    
    
    # Initialize a variable for counts (the decision variable) as integer
    C = cp.Variable(shape=(n, m), integer=True)
    
    # Compute the revenue and cost functions
    revenue = cp.sum(cp.matmul(cp.multiply(C, S).T, d))
    cost = cp.sum(cp.matmul(cp.multiply(C, H), b))
    
    # Construct row sums for resource flexibility constraint.
    # That is, if hours per case * case count results in:
    #   | 1 2 |
    #   | 3 4 |
    # We want the sum of each row repeated for as many columns there are:
    #   | 3 3 |
    #   | 7 7 |
    # Thus, element-wise multiplying this with Rmin will result in the minimum 
    # hours allowed and multiplying this with Rmax will result in the maximum 
    # hours allowed.
    row_sum = cp.matmul(
       cp.reshape(cp.sum(cp.multiply(C, H), axis = 1), shape = (n, 1)),
       np.ones((1, m))
    )
    
    # Construct the problem
    problem = cp.Problem(
       objective = cp.Maximize(revenue - cost),
       constraints = [
          cp.matmul(cp.multiply(C, H).T, np.ones(n)) <= t * f, # Hours constraint
          cp.sum(C, axis = 1) <= a,                            # Inventory constraint
          cp.sum(C, axis = 1) >= cmin,                         # Case volume floor constraint
          cp.sum(C, axis = 1) <= cmax,                         # Case volume ceiling constraint
          cp.multiply(C, H) >= cp.multiply(Rmin, row_sum),     # Resource flexibility floor
          cp.multiply(C, H) <= cp.multiply(Rmax, row_sum),     # Resource flexibility ceiling
          C >= 0                                               # Non-negative case counts constraint
       ]
    )
    
    # Solve the problem
    problem.solve()

    # Return the rounded values of C (or possible -inf, inf)
    return C.value

## Function converts event dictionary received from lambda function
## into a form that can be fed into optimizePlan
#  
#  Input: event - dictionary from lambda function
#  Output: list that can be input into optimizePlan
#    e.g. [t, f, d, b, a, S, H, cmin, cmax, Rmin, Rmax]
def _read_event(event):
    ## See default_input.json for format of input type ##

    # Constants for use (TO BE ADJUSTED)
    MAX_CASE_VOLUME = 1e14
    HOURS_PER_FTE = 2000
    # REVENUE_PER_CASE = 1 # TEMPORARY ASSUMPTION
    # SUCCESS_RATE = 1. # TEMPORARY ASSUMPTION
    
    # lists that keep track of case and worker types
    case_list = [] # list of all possible cases 
    worker_list = [] # list of all possible worker types
    
    
    ## Looping through case types to retrieve title, # of cases, hrs to complete case
    
    # a_i = Available inventory for case type i
    # H_ij = Hours per case for case type i by worker type j
    a = []
    H = np.empty([1, len(event['fte'])])
    for c, c_attr in event['ai'].items():
        case_list.append(c) # add title to case_list
        a.append(c_attr['cases'])
        H = np.append(H, np.matlib.repmat(c_attr['hours'],1,len(event['fte'])), axis=0 )
    H = np.delete(H, 0, 0) #remove first empty row
    a = np.array(a).astype(float)
    
    # t = Hours per FTE
    t = np.array(HOURS_PER_FTE).astype(float) #hours possible for FTE
    
    ## Looping through worker types to retrieve worker title, burn rate, and # of FTEs
    # f_j = FTE for worker type j
    # b_j = $ burn rate per hour for worker type j
    f = []
    b = []

    print('----------------------------')
    print(event['fte'].items())

    for w, w_attr in event['fte'].items():
        worker_list.append(w)
        f.append(w_attr['fte'])
        b.append(w_attr['burnRate'])
    f = np.array(f).astype(float)
    b = np.array(b).astype(float)

    print(worker_list)
    print(len(worker_list))
    print('----------------------------')
        
        
    # d_i = $ per case (revenue) for case type i
    d = np.array([2000,2200,1800]).astype(float)
    #d = np.tile(REVENUE_PER_CASE, len(data['ai'])) # TEMPORARY ASSUMPTION
    
    #S_ij = Success rate (percentage) for case type i by worker type j
    S = np.array([[0.9, 0.8, 0.7],]*len(event['fte'])).transpose()
    #S = np.tile(SUCCESS_RATE, (len(event['ai']), len(event['fte']))) # TEMPORARY ASSUMPTION
    
    # cmin_i = Minimum case volume allowed for case type i
    # cmax_i = Maximum case volume allowed for case type i
    
    cmin = np.zeros([1, len(event['ai'])]) #initialize with zeros
    cmax = np.full([1, len(event['ai'])], MAX_CASE_VOLUME) #initialize with MAX_CASE_VOLUME
    consmax = ('be less than', 'not exceed')
    consmin = ('be more than', 'be at least')
    for cn_dict in event['cc']['constraints']:
        # Find index of case constraint
        idx = case_list.index(cn_dict['case_type'])
        
        # Evaluate comparator
        if cn_dict['comparator'] in consmax:
            cmax[0,idx] = cn_dict['volume']
        elif cn_dict['comparator'] in consmin:
            cmin[0,idx] = cn_dict['volume']
    cmin = cmin.flatten()
    cmax = cmax.flatten()
    
    # rmin_ij = Minimum percent worked by worker type j on case type i
    # rmax_ij = Maximum percent worked by worker type j on case type i
    Rmin = np.zeros([len(event['ai']), len(event['fte'])]) #initialize with zeros
    Rmax = np.ones([len(event['ai']), len(event['fte'])]) #initialize with ones
    
    for flex_dict in event['rf']['flexibility']:
        # Find index of worker constraint
        i_idx = case_list.index(flex_dict['case_type'])
        j_idx = worker_list.index(flex_dict['worker'])
        
        percent = int(flex_dict['percent'])/100. #convert percent to decimal
        
        flexmin = ('At least', 'More than')
        flexmax = ('Less than', 'No more than')
        
        # Evaluate comparator
        if flex_dict['comparator'] in flexmin:
            Rmin[i_idx,j_idx] = percent
        elif flex_dict['comparator'] in flexmax:
            Rmax[i_idx,j_idx] = percent
    return t, f, d, b, a, S, H, cmin, cmax, Rmin, Rmax, case_list, worker_list

#def main():
#    with open('./default_input.json') as json_file:
#        event = json.load(json_file)
#        output_id = 'lad'
#        _id = 'mad'
#        print(run_optimizer(event, output_id, _id))
#        
#    json_file.close()
#    
#if __name__ == '__main__':
#    main()
        