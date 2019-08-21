db.persons.aggregate([
    {$group : {
        _id : { eyecolor : "$eyeColor" },
        avgAge : {$avg : "$age"}
    }}    
])
//returns docs with same eye colour and the group's corresponding average age
//group all docs with same eye colour
//accumulate avg of all ages in the same group of docs