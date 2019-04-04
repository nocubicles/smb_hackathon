
const credentialsUpdateDeliveries = require("./credentials")
const hostName = credentialsUpdateDeliveries.hostName;
const soap = require('soap');
const path = require('path');

const endPointQueryDelivery = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/queryoutbounddeliveryin?sap-vhost=${hostName}.sapbydesign.com`;
const endPointReadDelivery = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/yy83u8cg2y_zoutbounddeliveryup?sap-vhost=${hostName}.sapbydesign.com`;

var WSDLQuery = path.resolve("QueryDeliveries.wsdl");
var WSDLReadDelivery = path.resolve("ZOUTBOUNDUPDATE.wsdl");
const deliveries = ["22648", "22639", "22637"];

deliveries.forEach(async function(delivery) {

    const returnedDeliveryUUID = await queryDelivery(delivery);

    const deliveryItems = await getDeliveryItems(returnedDeliveryUUID);



});



function queryDelivery(delivery) {
    return new Promise(function (resolve, reject) {
        //do something with reject
        const options = {
            namespaceArrayElements: true
        }

        const args = {
            "OutboundDeliveryFindByElementsRequestMessageBody": {
                "SelectionByID": {
                    "InclusionExclusionCode": "i",
                    "IntervalBoundaryTypeCode": 1,
                    "LowerBoundaryIdentifier": delivery

                }
            },
            "ProcessingConditions": {
                "QueryHitsMaximumNumberValue": 1,
                "QueryHitsUnlimitedIndicator": false
            }
        }

        soap.createClient(WSDLQuery, options, function (err, client) {
            //if (err) throw new Error("ciao");

            if (err) throw new Error(err);




            client.setEndpoint(endPointQueryDelivery);
            client.setSecurity(new soap.BasicAuthSecurity(credentialsUpdateDeliveries.user, credentialsUpdateDeliveries.password));


            client.FindByElements(args, function (err, res) {

                if (err) {
                    //console.log(err)
                    //console.log(client.lastRequest) //<--Will show the last request for debugging		
                    resolve(err.response.body)
                }


                if (!err) {
                    resolve(res.OutboundDelivery[0].OutboundDeliveryUUID)
                }
            })
        });
    })
}

function getDeliveryItems(UUID) {
    return new Promise(function (resolve, reject) {
        //do something with reject
        const options = {
            namespaceArrayElements: true
        }

        const args = {
            "OutboundDelivery": {
               "UUID": UUID
            }
        }

        soap.createClient(WSDLReadDelivery, options, function (err, client) {
            //if (err) throw new Error("ciao");

            if (err) throw new Error(err);




            client.setEndpoint(endPointReadDelivery);
            client.setSecurity(new soap.BasicAuthSecurity(credentialsUpdateDeliveries.user, credentialsUpdateDeliveries.password));


            client.Read(args, function (err, res) {

                if (err) {
                    //console.log(err)
                    //console.log(client.lastRequest) //<--Will show the last request for debugging		
                    resolve(err.response.body)
                }


                if (!err) {
                    resolve(res.OutboundDelivery.Item)
                }
            })
        });
    })
}


