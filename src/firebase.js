import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAz3_rnpFozAiKRV5_qX0a9Mx4_UNshASM",
  authDomain: "miappfitness-1098d.firebaseapp.com",
  projectId: "miappfitness-1098d",
  storageBucket: "miappfitness-1098d.appspot.com",
  messagingSenderId: "689260087420",
  appId: "1:689260087420:web:09f2b292dba38d1141e1f9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Inicializa Messaging
const messaging = getMessaging(app);

// Solicita permiso y obtiene el token de notificación
export const requestPermissionAndGetToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: '<YOUR_VAPID_KEY>' });
      console.log('Token de notificación:', token);
      return token;
    } else {
      console.log('Permiso para notificaciones no concedido');
    }
  } catch (error) {
    console.error('Error al obtener token de notificación', error);
  }
};

// Maneja notificaciones en primer plano
export const onMessageListener = (callback) =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
      callback(payload);
    });
  });