importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCd-l69OyPvzz7L-6RNYq3FDmpzV1jUcU0",
  authDomain: "goss-up.firebaseapp.com",
  projectId: "goss-up",
  storageBucket: "goss-up.appspot.com",
  messagingSenderId: "495507821923",
  appId: "1:495507821923:web:32845d70448550b5beef56",
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification;
  if(!notification) return;
  const { title, body, icon } = notification;
  const notificationTitle = title;
  const notificationOptions = {
    body: body,
    icon: icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
