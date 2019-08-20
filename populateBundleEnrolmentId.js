use "test_script_database"
var arrayUserIds = db.VideoEngagement.distinct("userId");
for(var i=0 ; i < arrayUserIds.length ; i++) {
    var cursor = db.BundleEnrolment
                .find({
                    userId : arrayUserIds[i], 
                    status :"ACTIVE"    
                    })
                .limit(1)
                .project({_id : 1});
                if(!cursor.hasNext()){
                printjsononeline(arrayUserIds[i]);
                }
    while(cursor.hasNext()) {
        var beid = cursor.next()._id + '';
        db.VideoEngagement.update({userId : arrayUserIds[i]}, 
            {$set:{bundleEnrollmentId : beid}}, 
            { multi: true, upsert: false}
        )
    }
}