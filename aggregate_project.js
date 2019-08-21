db.persons.aggregate([
    {$project : {
    	"name" : 1,
    	"company.location.country" : 1,
    	_id : 0
    }}
    ])