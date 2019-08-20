db.persons.aggregate([
	{$group : {_id : {eyeColor : "$eyeColor", age : "$age", gender: "$gender"}}},
    {$match : {"_id.eyeColor" : "blue"}}
    ])

