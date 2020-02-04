var generateMessage = function (username,text) {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    };
};

var generateLocationMessage = function(username ,url) {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    };
};
module.exports = {
    generateMessage,
    generateLocationMessage
};