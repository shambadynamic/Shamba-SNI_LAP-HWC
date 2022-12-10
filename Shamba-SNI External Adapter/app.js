const axios = require('axios')
require('dotenv').config();
const token = process.env.TOKEN;

const createRequest = (input, callback) => {

    const jobRunID = input['id']

    var tx_hash = ''
    var contract_address = ''
    var operator_address = ''

    const category = input['data']['category']
    const geometry = input['data']['geometry']
    const start_date = input['data']['start_date']
    const end_date = input['data']['end_date']


    if ('tx_hash' in input) {
        tx_hash = input['tx_hash']
    }

    if ('contract_address' in input) {
        contract_address = input['contract_address']
    }

    if ('operator_address' in input) {
        operator_address = input['operator_address']
    }

    var endpoint

    if (category == "LAP") {
        endpoint = 'sni-lap'
    }
    else if (category == "HWC") {
        endpoint = 'sni-hwc'
    }
    else {
        callback(403, {
                    "jobRunID": [jobRunID],
                    "status": "errored",
                    "error": {
                        "name": "Invalid Category. The category parameter can either be LAP or HWC.",
                    },
                    "statusCode": 403
                })
    }

    const url = `https://sni-data-service-isll3n7dtq-ey.a.run.app/api/v1/sni/${endpoint}`
    
    const data = {
        geometry,
        start_date,
        end_date,   
    }

    axios
        .post(url, data)
        .then(res => {
            if (res.status == 200) {
                var datetime = new Date();

                res.data.jobRunID = jobRunID
                res.data.statusCode = res.status

                if (res.data.errors.length != 0) {
                    var res = {
                        "status": 404,
                        "data": {
                            "jobRunID": jobRunID,
                            "status": "errored",
                            "error": {
                                "name": "No data",
                            },
                            "statusCode": 404
                        }

                    }
                    callback(res.status, res.data)

                }

                var final_result = {}

                for (var data of Object.entries(res.data.data)) {

                    if (data[0] == 10) {
                        break
                    } 
                    else {
                        if (final_result.hasOwnProperty('dataId')) {
                            final_result['dataId'].push(data[1]['_data_id'])
                        }
                        else {
                            final_result['dataId'] = [data[1]['_data_id']]
                        }

                        if (category == "LAP") {
                            if (final_result.hasOwnProperty('recordWhat')) {
                                final_result['recordWhat'].push(String(data[1]['RECORD_WHAT']))
                            }
                            else {
                                final_result['recordWhat'] = [String(data[1]['RECORD_WHAT'])]
                            }
                        }
                        else {
                            if (final_result.hasOwnProperty('predator')) {
                                final_result['predator'].push(String(data[1]['Predator_r']))
                            }
                            else {
                                final_result['predator'] = [String(data[1]['Predator_r'])]
                            }
                        }
                    }
                }

                res.data.result = final_result
                 

                delete res.data.success
                delete res.data.errors
                delete res.data.message


                var web3_json_data = {
                    "request": {
                        "category": category,
                        "geometry": geometry,
                        "start_date": start_date,
                        "end_date": end_date
                    },
                    "response": {
                        "datetime": datetime.toISOString(),
                        "result": res.data.data,
                        "contract_address": contract_address,
                        "operator_address": operator_address,
                        "tx_hash": tx_hash
                    }
                }

                delete res.data.data

                axios.post('https://api.web3.storage/upload', web3_json_data, {
                    headers: {
                   
                    Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    var response_data = response.data
                    const cid = response_data.cid

                    final_result["cid"] = cid
                    var res = {
                        "status": 200,
                        "data": {
                            "jobRunID": jobRunID,
                            "status": "success",
                            "result": final_result,
                            "message": `Data successfully uploaded to https://dweb.link/ipfs/${cid}`,
                            "statusCode": 200
                        }
                    }
                    callback(res.status, res.data)

                }).catch(error => {
                    console.error('There was an error!', error);
                    var res = {
                        "status": 405,
                        "data": {
                            "jobRunID": jobRunID,
                            "status": "errored",
                            "error": {
                                "name": "Unable to upload data to web3 store",
                            },
                            "statusCode": 405
                        }

                    }
                    callback(res.status, res.data)
                });


            } else {
                res.data = {
                    "jobRunID": [jobRunID],
                    "status": "errored",
                    "error": {
                        "name": "AdapterError",
                    },
                    "statusCode": [res.status]
                }
                callback(res.status, res.data)

            }

        })
        .catch(error => {
            console.error(error)
            var res = {
                "status": 400,
                "data": {
                    "jobRunID": jobRunID,
                    "status": "errored",
                    "error": {
                        "name": "AdapterError",
                    },
                    "statusCode": 400
                }

            }

            callback(res.status, res.data)
        })

}

module.exports.createRequest = createRequest