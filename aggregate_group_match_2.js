db.persons.aggregate([
        {$match: {gender : "female" }},
        {$group : {_id : {eyeColor : "$eyeColor", age : "$age", gender: "$gender"}}}
    ])