db.persons.aggregate([
    {$group : {_id : {
        favoriteFruit : "$favoriteFruit",
        eyeColor : "$eyeColor"
    }}},
    {$sort : {"_id.favoriteFruit" : 1, "_id.eyeColor" : -1}}
    ])