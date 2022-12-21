var items = [];      //item holder
var listHolder = document.getElementById('list-holder');        //list holder
var addTodo = document.getElementById('add-item');          //add item button

//adding a loadList function to populate my to do list
loadList = function()
{
    listHolder.innerHTML = "";      //clearing the listHolder anytime I call this function
    items.forEach((element, index) => {
        let listItem = document.createElement('li');        //creating a List Item element when adding an item to the list
        listItem.className = "list-group-item todo-list";   //setting up the classes for the elements
        listItem.innerHTML ="<i class='fas fa-pencil-alt text-info mx-2'></i>" + element;                       //setting up its inner HTML
        
        //adding an eventListener for each item that gets done
        listItem.addEventListener('click', function(){
            listItem.classList.toggle("done");              //item gets crossed-out and greyed-out when clicked
        });

        //adding an eventListener to remove items when double-clicked
        listItem.addEventListener("dblclick", function(){
            items.splice(index, 1);                         //splice method to remove the item defined by the index, 1 because I'll only remove one item
            loadList();                                     //after removing an item, the list gets refreshed    
        })
        
        listHolder.appendChild(listItem);                   //appending item to the listHolder
    });
}

//adding an event listener when clicking on Add Item button
addTodo.addEventListener('click', function(){
    let txtTodo = document.getElementById('txt-todo-name');     //getting the text input
    let todoName = txtTodo.value;                               //considering the value of text input

    if(todoName != ""){                         //if I input text: todoName goes into my "items" array
        items.push(todoName);       
        txtTodo.value = "";
        console.log("Item added!");
        loadList();
    }else{                                      //if I input no text: alert
        alert("You must provide an item!");
    }
});

//pressing Enter key to add an item - non funzionaaaa
addTodo.addEventListener('keypress', function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        document.getElementById("add-item").click();
    }
});

//darkmode script
function darkMode()
{
    var element1 = document.body;
    element1.classList.toggle("darkmode");

    //non funzionaaa
    var element2 = document.body.li;
    element2.classList.toggle("darkmode");
}




function GetRandomItem()
{
    var limit = 1;
    $.ajax({
        method: 'GET',
        url: 'https://api.api-ninjas.com/v1/facts?limit=' + limit,
        headers: { 'X-Api-Key': 'N1Pj2m09VHoX7fwJa9JxAw==lczET40O9sNCT0N9'},
        contentType: 'application/json',
        success: function(result) {
            console.log(result);
            document.getElementById('fact').innerText=result[0].fact;
        },
        error: function ajaxError(jqXHR) {
            console.error('Error: ', jqXHR.responseText);
        }
    });
}
