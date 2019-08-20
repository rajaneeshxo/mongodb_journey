db.persons.aggregate([
    {$match : {age : {$gte : 25}, gender : "female"}}
    ])