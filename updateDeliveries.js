//this program allows to update outbound delivery item storage location in over-the-counter flow


const credentialsUpdateDeliveries = require("./credentials") //create a export module where you can store your credentials.
const hostName = credentialsUpdateDeliveries.hostName;
const soap = require('soap');
const path = require('path');
const util = require('util')
var fs = require('fs');

const endPointQueryDelivery = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/queryoutbounddeliveryin?sap-vhost=${hostName}.sapbydesign.com`;
const endPointReadandUpdateDelivery = `https://${hostName}.sapbydesign.com/sap/bc/srt/scs/sap/yy83u8cg2y_zoutbounddeliveryup?sap-vhost=${hostName}.sapbydesign.com`;

var WSDLQuery = path.resolve("QueryDeliveries.wsdl");
var WSDLReadandUpdateDelivery = path.resolve("ManageOutboundDeliveries.wsdl");

const deliveries = require('./deliveriesTest.js')

deliveries.forEach(async (delivery) => {

    try {
        const returnedDeliveryUUID = await queryDelivery(delivery);

        const deliveryObject = await getDeliveryItems(returnedDeliveryUUID);
        let storageLocation = deliveryObject.ShipFromLocation.LocationID;

        storageLocation = storageLocation + '-0'; //making the shipfrom location into storage location by adding -01 to the end

        const deliveryItemsMissingLogisticsArea = deliveryObject.Item.filter(item => !item.InventoryChangeItem[0].LogisticsAreaKey); //filtering out all items where storage location is missing

        let newItemsWithStorageLocation = [];

        deliveryItemsMissingLogisticsArea.forEach(item => {
            const itemObj = {
                attributes: {
                    ActionCode: '02',

                },
                UUID: item.UUID,
                InventoryChangeItem: {
                    UUID: item.InventoryChangeItem[0].UUID,
                    LogisticsAreaKey: {
                        ID: storageLocation
                    }
                }
            }
            newItemsWithStorageLocation.push(itemObj)
        });

        const argsForUpdateDelivery = {
            OutboundDelivery: {
                attributes: {
                    BusinessTransactionDocumentReferenceListCompleteTransmissionIndicator: 'false',
                    ItemListCompleteTransmissionIndicator: 'false'
                },
                UUID: returnedDeliveryUUID,
                Item: newItemsWithStorageLocation
            }
        }

        const updatedDelivery = await updateDeliveryItems(argsForUpdateDelivery);

        console.log(updatedDelivery)
    } catch (error) {
        console.log(error);
    }


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
                    fs.appendFileSync('errorLog', "Error with First step" + util.inspect(err, false, null, true))

                    resolve(err)
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

        soap.createClient(WSDLReadandUpdateDelivery, options, function (err, client) {
            //if (err) throw new Error("ciao");

            if (err) throw new Error(err);




            client.setEndpoint(endPointReadandUpdateDelivery);
            client.setSecurity(new soap.BasicAuthSecurity(credentialsUpdateDeliveries.user, credentialsUpdateDeliveries.password));


            client.Read(args, function (err, res) {

                if (err) {
                    //console.log(err)
                    //console.log(client.lastRequest) //<--Will show the last request for debugging
                    fs.appendFileSync('errorLog', "Error with Second step" + util.inspect(err, false, null, true))
                    resolve(err)
                }


                if (!err) {
                    resolve(res.OutboundDelivery)
                }
            })
        });
    })
}

function updateDeliveryItems(args) {
    return new Promise(function (resolve, reject) {
        //do something with reject
        const options = {
            namespaceArrayElements: true
        }

        soap.createClient(WSDLReadandUpdateDelivery, options, function (err, client) {
            //if (err) throw new Error("ciao");

            if (err) throw new Error(err);




            client.setEndpoint(endPointReadandUpdateDelivery);
            client.setSecurity(new soap.BasicAuthSecurity(credentialsUpdateDeliveries.user, credentialsUpdateDeliveries.password));


            client.Update(args, function (err, res) {

                if (err) {
                    //console.log(err)
                    //console.log(client.lastRequest) //<--Will show the last request for debugging	
                    fs.appendFileSync('errorLog', "Something went wrong update " + util.inspect(err, false, null, true))
                    resolve("error happened with the request" + util.inspect(args, false, null, true))
                }


                if (!err) {
                    //console.log(client.lastRequest) //<--Will show the last request for debugging		

                    if (res.Log.Item[0].Note.includes("successful")) {
                        fs.appendFileSync('successLog', "Operation successful with " + util.inspect(args, false, null, true))
                        resolve("Operation successful with " + util.inspect(args, false, null, true))
                    } else {
                        fs.appendFileSync('errorLog', "Something went wrong update " + util.inspect(args, false, null, true))
                        resolve("Something went wrong " + util.inspect(args, false, null, true))
                    }
                }
            })
        });
    })
}


