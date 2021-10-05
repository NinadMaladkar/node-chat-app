const users = [];

//addUser
const addUser = ({ id, username, room }) => {
    if (!username && !room) {
        return {
            error: 'Username and room are required'
        }
    }
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //check for existing user & validate
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//remove User
removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//get User
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//get Users In Room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}