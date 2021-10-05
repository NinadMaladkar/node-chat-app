const socket = io();

const messageForm = document.querySelector('#message-form');
const messageFormInput = document.querySelector('#message');
const messageFormButton = document.querySelector('#submit');

const sendLocationButton = document.querySelector('#send-location');

const messages = document.querySelector('#messages');

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = messages.offsetHeight;

    // Height of messages container
    const containerHeight = messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.username,
        location: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    messageFormButton.setAttribute('disabled', 'disabled')

    let msg = e.target.elements.message.value;
    socket.emit('sendMessage', msg, (receipt) => {

        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus();

        console.log('Message delivered!', receipt);
    });
})


sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by user browser!')
    }

    sendLocationButton.setAttribute('disabled', 'disabled')
    sendLocationButton.innerText = 'Loading..'

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        socket.emit('sendLocation', lat, long, (receipt) => {
            sendLocationButton.removeAttribute('disabled');
            sendLocationButton.innerText = 'Send my location';

            console.log('location sent!', receipt);
        });
    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
})