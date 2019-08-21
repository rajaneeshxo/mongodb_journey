db.persons.aggregate([
    {$project : {
    	"name" : 1,
    	_id : 0,
    	info : {
    	    eyes : "$eyeColor",
    	    country : "$company.location.country",
    	    fruit : "$favoriteFruit"
    	}
    }}
    ])
    