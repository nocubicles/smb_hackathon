
const serviceUser = '_HACKATHONSY'; //needs user
const serviceUserPW = 'SMBSummit2019!'; //needs psw
const hostName = 'my347100';
const soap = require('soap');
const path = require('path');


const WSDLendPointPost = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/maintainleadin?sap-vhost=${hostName}.sapbydesign.com`;

var WSDL = path.resolve("manageLeads.wsdl")

const args =  {
    "Lead": {
        "attributes": {
            "actionCode": "01",
            "itemListCompleteTransmissionIndicator": "true"
        },
        "ObjectNodeSenderTechnicalID": {},
        "ChangeStateID": {},
        "UUID": {},
        "ID": {},
        "Name": "Hackhaton HELLO WORLD",
        "QualificationLevelCode": {},
        "StartDate": "2019-04-02",
        "EndDate": "2019-04-02",
        "LifeCycleStatusCode": {},
        "StatusValidSinceDate": {},
        "GroupCode": {},
        "OriginTypeCode": "004",
        "ResultReasonCode": {},
        "CampaignPredecessorReferenceID": {},
        "Note": {
            "attributes": {
                "actionCode": "01"
            },
            "ObjectNodeSenderTechnicalID": {},
            "ContentText": "Hackhaton Note NEW ONE"
        },
        "Item": {
            "attributes": {
                "actionCode": "01"
            },
            "ObjectNodeSenderTechnicalID": {},
            "UUID": {},
            "ID": "10",
            "Description": {},
            "QuantityValue": "2",
            "ProductUUID": {},
            "MaterialInternalID": "P100201",
            "ServiceProductInternalID": {},
            "ProductCategoryInternalID": {}
        },
        "MarketingResponsibleEmployeeParty": {
            "BusinessPartnerInternalID": "EXT9001"
        },
        "SalesResponsibleEmployeeParty": {
            "BusinessPartnerInternalID": "EXT9001"
        },
        "ProspectParty": {
            "attributes": {
                "partyContactPartyListCompleteTransmissionIndicator": "true",
                "actionCode": "04"
            },
            "BusinessPartnerInternalID": "CP100140",
            "ContactParty": {
                "attributes": {
                    "actionCode": "04"
                },
                "ObjectNodeSenderTechnicalID": {},
                "BusinessPartnerInternalID": "CP100140",
                "MainIndicator": "true"
            }
        }
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


            client.MaintainBundle(args, function (err, res) {

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