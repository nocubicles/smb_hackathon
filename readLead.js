
const serviceUser = '_HACKATHONSY'; //needs user
const serviceUserPW = 'SMBSummit2019!'; //needs psw
const hostName = 'my347100';
const soap = require('soap');
const path = require('path');


const WSDLendPointPost = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/queryleadin?sap-vhost=${hostName}.sapbydesign.com`;

var WSDL = path.resolve("queryLeads.wsdl")

const args =  {
    "LeadOverviewSimpleSelectionByElements": {
        "SelectionByLeadID": {
            "InclusionExclusionCode": "I",
            "IntervalBoundaryTypeCode": "1",
            "LowerBoundaryLeadID": "1631"
        }
    },
    "ProcessingConditions": {
        "QueryHitsUnlimitedIndicator": "true"
    }
}


function leadsCreate(args) {
    return new Promise(function (resolve, reject) {
        //do something with reject
        const options = {
            namespaceArrayElements: true
        }
        soap.createClient(WSDL, options, function (err, client) {
            //if (err) throw new Error("ciao");
         
            if (err) throw new Error(err);
         



            client.setEndpoint(WSDLendPointPost);
            client.setSecurity(new soap.BasicAuthSecurity(serviceUser, serviceUserPW));


            client.FindOverviewSimpleByElements(args, function (err, res) {

                if (err) {
                    //console.log(err)
                    //console.log(client.lastRequest) //<--Will show the last request for debugging		
                    resolve(err.response.body)
                }


                if (!err) {
                    console.log(res)
                }
            })
        });
    })
}


leadsCreate(args)