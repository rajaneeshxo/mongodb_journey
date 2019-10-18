const logger = require('tracer').colorConsole({
    format: "{{timestamp}} pid:" + process.pid + " <{{title}}> {{message}} (in {{file}}:{{line}})",
    level: "log"
});
const Long = require('mongodb').Long;
const Q = require("q");
const restler = require("./restlernew")
const request = require('request');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

let subscriptionDB;
let enrolmentObject;
let dineroDB;
MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
    if (err) {
        logger.error(err);
    }
    subscriptionDB = client.db("vedantusubscription");
    logger.info("connection successful" + subscriptionDB);
});

MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
    if (err) {
        logger.error(err);
    }
    dineroDB = client.db("DEV4-platformDinero");
    logger.info("connection successful" + dineroDB);
    testFunction();
});

async function callapi(item) {
    var deferred = Q.defer();
    logger.info("json passed to api", JSON.stringify(item));
    var url = 'https://dev4-platform.vedantu.com/subscription/enroll/createTopUpEnrollmentConsumption';
    await restler.newpost(url,item,
        {
            "Content-Type": "application/json",
            "X-Ved-Token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJtYW5pc2guc2luZ2hAdmVkYW50dS5jb20iLCJleHAiOjE1NzE0MjMxMzcsImlzcyI6InZlZGFudHUuY29tIiwic2Vzc2lvbkRhdGEiOiJ7XCJmaXJzdE5hbWVcIjpcIk1hbmlzaFwiLFwibGFzdE5hbWVcIjpcIlNpbmdoXCIsXCJ1c2VySWRcIjo0MTAyMzc2NzI2NDYzMjg3LFwiZW1haWxcIjpcIm1hbmlzaC5zaW5naEB2ZWRhbnR1LmNvbVwiLFwicm9sZVwiOlwiQURNSU5cIixcImNvbnRhY3ROdW1iZXJcIjpcIjk1Mzg4OTI3MjlcIixcInBob25lQ29kZVwiOlwiOTFcIixcImNyZWF0aW9uVGltZVwiOjE1NzEzMzY3MzczOTgsXCJleHBpcnlUaW1lXCI6MTU3MTQyMzEzNzM5OCxcImlzRW1haWxWZXJpZmllZFwiOmZhbHNlLFwiaXNDb250YWN0TnVtYmVyVmVyaWZpZWRcIjpmYWxzZSxcImlzQ29udGFjdE51bWJlckRORFwiOmZhbHNlLFwiaXNDb250YWN0TnVtYmVyV2hpdGVsaXN0ZWRcIjpmYWxzZSxcInJlZmVycmFsQ29kZVwiOlwibWFuaWQzZTFcIixcInRuY1ZlcnNpb25cIjpcInY2XCIsXCJkZXZpY2VcIjpcIldFQlwiLFwicGFzc3dvcmRBdXRvZ2VuZXJhdGVkXCI6dHJ1ZX0ifQ.knonv0aw8IgKaGnjU0olNWW39UPLIC8z1TlPpvAg72Lkv0OI7TA61_-HBck3pUpVTAhbV_OMXIU7oDuMvepQsw"
        }).then(function (resp) {
        if (!resp) {
            logger.error("error in updating " + JSON.stringify(item));
        } else {
            logger.info("Success");
        }
        deferred.resolve(resp);
    }).catch(function (e) {
        logger.error(e)
    });
    return deferred.promise;
}


function fetchEnrollmentDoc(enrollmentId) {
    var deferred = Q.defer();
    subscriptionDB.collection('Enrollment').find(
        {_id : ObjectId(enrollmentId)},
        { projection: {_id : 1, batchId : 1, userId : 1, courseId : 1, creationTime :1} })
        .toArray(function (err, orders) {
            if (err) {
                logger.error("Error in fetching users", err);
                deferred.reject(null);
            } else {
                logger.info("No error");
                deferred.resolve(orders);
            }
        });
    return deferred.promise;
}

function createOrder(enrolmentObj, currentTime) {
    logger.info("enrolmentObj : ",JSON.stringify(enrolmentObj));
    let deferred = Q.defer();
    dineroDB.collection('Orders')
        .insertOne(
            {
                "_class" : "com.vedantu.dinero.entity.Orders",
                "userId": Long.fromNumber(parseInt(enrolmentObj.userId)),
                "amount" : 0,
                "paymentStatus" : "PAID",
                "paymentType" : "BULK",
                "items" : [{
                    "entityId" : enrolmentObj.batchId.toString(),
                    "entityType" : "OTF_BATCH_REGISTRATION",
                    "count" : 1,
                    "rate" : 0,
                    "cost" : 0,
                    "promtionalCost" : 0,
                    "nonPromotionalCost" : 0,
                    "teacherDiscountAmount" : 0,
                    "vedantuDiscountAmount" : 0,
                    "deliverableEntityType" : "OTF_BATCH_ENROLLMENT",
                    "deliverableEntityId" : enrolmentObj._id.toString()
                }],
                "lastUpdated" : Long.fromNumber(currentTime),
                "lastUpdatedBy" : "SYSTEM",
                "promotionalAmount" : 0,
                "nonPromotionalAmount" : 0,
                "purchaseFlowType" : "DIRECT",
                "purchasingEntities" : [{
                    "entityType" : "OTF",
                    "entityId" : enrolmentObj.batchId.toString(),
                    "deliverableId" : enrolmentObj._id.toString()
                }],
                "entityState" : "ACTIVE",
                "creationTime" : Long.fromNumber(enrolmentObj.creationTime),
                "createdBy" : "SYSTEM"
            },
            function (err, newOrder) {
                if (err) {
                    logger.error("Error in fetching user", err);
                    process.exit();
                } else {
                    logger.info("order created", newOrder);
                    deferred.resolve(newOrder);
                }
            });
    return deferred.promise;
}

async function testFunction() {
    try {
        logger.info("**************************db connections formed: work starts here******************************");
        //populate your enrolmentIds in this list
        let enrollmentIds = ['5d879a88918a4618096b90b8',
            '5d88b58f80fbb477eba0d8d8',
            '5d8e1554223acc7ae3affb2e',
            '5d90d1f74a809f5e2785a99d',
            '5d91f3bdb7e4194f29bfba06',
            '5d95e3aab58f5f3793cbc3b3',
            '5d961ddfbe69b345d5791e5e',
            '5d9a2d4cf70b142e99a5ad71',
            '5d9b8be205dfd138df311909',
            '5d920adab22c7c2de451f88a',
            '5d9b7187a414ce2faef93d67',
            '5d7e404b1c8e615eb807b315',
            '5d7e41fe58bf7471c8752e3d',
            '5d7f92551c8e615eb807b4fc',
            '5d822f60a6883420dc589041',
            '5d8346b9918a4618096b8914',
            '5d84b5b380fbb477eba0d0f3',
            '5d86ec2780fbb477eba0d533',
            '5d90445d4a809f5e2785a843',
            '5d90b942f0988a4410f8e1c7'
            ];
        let currentTime = 0;
        for (let i = 0;i < enrollmentIds.length;i++) {
            logger.info("fetching doc with enrollmentId", enrollmentIds[i]);
           var fetchedEnrollmentDoc = await fetchEnrollmentDoc(enrollmentIds[i]);
           logger.info("fetched enroll doc", fetchedEnrollmentDoc);

           currentTime = (new Date).getTime() - 10;
           var newOrderDoc = await createOrder(fetchedEnrollmentDoc[0], currentTime);
           logger.info("created order object response \n \n \n", newOrderDoc);
           logger.info("created order id -- ", newOrderDoc.ops[0]._id);
           var dataString = {
               "enrollmentId": fetchedEnrollmentDoc[0]._id.toString(),
               "courseId": fetchedEnrollmentDoc[0].courseId.toString(),
               "batchId": fetchedEnrollmentDoc[0].batchId.toString(),
               "orderId": newOrderDoc.ops[0]._id.toString(),
               "enrollmentTransactionContextType": "REGISTRATION_PAYMENT",
               "amt": 0,
               "amtP": 0,
               "amtNP": 0,
               "antFromDiscount": 0,
               "amtToBePaid": 0,
               "duration": 0,
               "createConsumptionIfnotFound": true
           };
           var resp = await callapi(dataString);
           logger.info("finished process", resp);

        }
    }
    catch(error) {
        logger.info("Generated error is : ", error);
    }
}
