var socket = io();

//Elements
var $messageForm = document.querySelector("#message-form");
var $messageFormInput = $messageForm.querySelector("input");
var $messageFormButton = $messageForm.querySelector("button");
var $sendLocationButton = document.querySelector("#send-location");
var $messages = document.querySelector("#messages");

//template
var messageTemplate = document.querySelector("#message-template").innerHTML;
var locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
var sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//option
var {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

var autoscroll = function () {
    //
    var $newMessage = $messages.lastElementChild;
    //Height of the new message
    var newMessageStyles = getComputedStyle($newMessage);
    var newMessageMargin = parseInt(newMessageStyles.marginBottom);
    var newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //visible height
    var visibleHeight = $messages.offsetHeight;

    //height of the message container
    var containerHeight = $messages.scrollHeight;

    // how far i scrol ?
    var scrolOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrolOffset) {
        $messages.scrollTop=$messages.scrollHeight;
     }

};


socket.on("message", function (message) {
    console.log(message);
    var html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

// for location message
socket.on("sendLocationMessage", function (message) {
    console.log(message);
    var html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

//room data for sidebar 
socket.on("roomData", function ({ room, users }) {
    var html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});


$messageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled"); //to  disable the button 

    var message = document.querySelector("input").value;
    socket.emit("sendMessage", message, function (error) {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log(" The message has delivered !");
    });

});
// for sending the location
$sendLocationButton.addEventListener("click", function (e) {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }
    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position);
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, function () {
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location shared");
        });
    });
});

socket.emit("join", {
    username,
    room
}, function (error) {
    if (error) {
        alert(error);
        location.href = "/";
    }
});