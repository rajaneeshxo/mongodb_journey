db.persons.aggregate([
    {$unwind: "$tags"},
    {$group : {
        _id : {
            tags : "$tags"
        },
        count : {$sum : 1}
    }}
])

//unwind all tags and return a doc with each array value
//then group them with the same tag
//accumulate the count of the docs with the same tag value
//returns _id : tag value, count of docs with this tag value