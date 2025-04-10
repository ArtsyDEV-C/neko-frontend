const socket = io("https://your-backend.up.railway.app");


socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('weather-alert', (data) => {
  console.log('Weather Alert:', data.msg);
  // Display the alert to the user
  alert(data.msg);
});
