db = $.couch.db("winetastingdb");

function updateitems() {
	$("#winelist").empty();
	db.view("winetastingapp/byname", {success: function(data) {
		for (i in data.rows) {
			$("#winelist").append('<div id="' + data.rows[i].value._id + '" class="itemrow"><span>' 
			+ data.rows[i].value.winename + "</span><span>&nbsp;" 
			+ data.rows[i].value.year + "</span><span>&nbsp;" 
			+ '<a href="#" id="' + data.rows[i].value._id
			+ '" class="edit">Edit Item</a>' + "</span><span>&nbsp;" 
			+ '<a href="#" id="' + data.rows[i].value._id
			+ '" class="remove">Remove Item</a>' + "</span></div>");
			}
		}
	});
}


function itemeditform(doctoedit) {  
    var formhtml;
    formhtml = 
        '<form name="update" id="update" action="">';

    if (doctoedit) { 
        formhtml = formhtml + 
            '<input name="docid" id="docid" type="hidden" value="' + doctoedit._id + '"/>';
    }

    formhtml = formhtml + 
        '<table>';

    formhtml = formhtml +
        '<tr><td>Name</td>' + 
        '<td><input name="name" type="text" id="winename" value="' + 
        (doctoedit ? doctoedit.winename : '') + 
        '"/></td></tr>';
    formhtml = formhtml + 
        '<tr><td>Year</td>' + 
        '<td><input name="year" type="text" id="year" value="' + 
        (doctoedit ? doctoedit.year : '') + 
        '"/></td></tr>';
     
    formhtml = formhtml + 
        '</table>' + 
        '<input type="submit" name="submit" class="update" value="' +
        (doctoedit ? 'Update' : 'Add') + '"/>' + 
        '</form>';
    $("#addwineform").empty();
    $("#addwineform").append(formhtml);
}  

function builddocfromform(doc,form) { 
    if (!doc) {
        doc = new Object;
    }
    doc.winename = form.find("input#winename").val();
    doc.year = form.find("input#year").val();
    
    return(doc);
}


$(document).ready(function() {
	updateitems();
	
	$("#winelist").click(function(event) {

    	var target = $(event.target);
    	if (target.is('a')) {
        	id = target.attr("id");

        	if (target.hasClass("edit")) {
            	db.openDoc(id, { success: function(doc) { 
                	itemeditform(doc);
            	}});
        	}
        
        	if (target.hasClass("remove")) {
            	html = '<span class="confirm">Really Delete? ' + 
                	'<a href="#" id="' + id + '" class="actuallydel">Delete</a>' +
                	'<a href="#" id="' + id + '" class="canceldel">Cancel</a></span>';
            	target.parent().append(html);
        	}
        
        	if (target.hasClass("actuallydel")) {
            
            	db.openDoc(id, { 
                	success: function(doc) { 
                    	db.removeDoc(doc, { success: function() {
                    	target.parents("div.itemrow").remove();
                    	}});
                	}
            	});
        	}
        
        	if (target.hasClass("canceldel")) {
            	target.parents("span.confirm").remove();
        	}
    	}
    });

		
	$("a.add").live('click', function(event) {  
        itemeditform();
    });
    
    $("input.update").live('click', function(event) {  
        var form = $(event.target).parents("form#update");  

        var id = form.find("input#docid").val();
        if (id) {
            db.openDoc(id, {
                success: function(doc) { 
                    db.saveDoc(builddocfromform(doc,form), {
                        success: function() { 
                            $("form#update").remove();
                            updateitems();
                        }});
                },
            });
        }
        else
        {
            db.saveDoc(builddocfromform(null,form), {
                success: function() { 
                    $("form#update").remove();
                    updateitems();
                },
            });
        }
        return false;
    });
    
});