db.persons.aggregate([
    {$match : {"gender" : "female"}},
    {$unwind: "$tags"},
    {$project :
    	{
    		"name" : 1, 
    		"info" : {
        		eyecolor : "$eyeColor",
        		country : "$company.location.country"
    	}
    }}
])