var users = [];

var addUser = function({
    id,
    username,
    room
}) {
    username: username.trim().toLowerCase();
    room: room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: "Username and room are required !"
        };
    }
    //check for esisting user 
    var existingUser = users.find(function(user) {
        return user.room === room && user.username === username;
    });
    //validate user
    if (existingUser) {
        return {
            error: "Username is in use"
        };
    }
    //Store the user
    var user = {
        id,
        username,
        room
    };
    users.push(user);
    return {
        user
    };
};

//remove user
var removeUser = function(id){
    var index = users.findIndex((user)=>user.id === id);
if(index!=-1){
    return users.splice(index,1)[0];
}
};

///
var getUser = function (id) {
    return users.find((user) => user.id === id);
};

///
var getUsersInRoom = function (room) {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};

// addUser({
//     id:22,
//     username:"Gaurav",
//     room:"Delhi"
// });
// console.log(users);


