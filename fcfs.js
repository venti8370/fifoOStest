// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5jJLuf_hG3aoCgCL24pRbShemP8a0ZOs",
  authDomain: "clinic-queue-os.firebaseapp.com",
  projectId: "clinic-queue-os",
  storageBucket: "clinic-queue-os.firebasestorage.app",
  messagingSenderId: "621044325048",
  appId: "1:621044325048:web:706312867a8ef0265af24d",
  measurementId: "G-R1JS2YXERG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();

// Add a patient to the queue
function addPatient() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name) return alert('Please enter a name.');
  const timeArrived = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., "9:56 PM"
  db.collection('queue').add({
    name,
    timeArrived,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  nameInput.value = '';
  nameInput.focus(); // Set focus back to the input field
}

// Handle Enter key press on nameInput
document.getElementById('nameInput').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent default form submission behavior
    addPatient();
  }
});

// Serve the next patient
function servePatient() {
  db.collection('queue')
    .orderBy('createdAt')
    .limit(1)
    .get()
    .then((snapshot) => {
      const status = document.getElementById('servedPatient');
      if (snapshot.empty) {
        status.textContent = 'Queue is empty.';
        return;
      }
      const firstDoc = snapshot.docs[0];
      const patientName = firstDoc.data().name;
      db.collection('queue').doc(firstDoc.id).delete();
      status.textContent = `Now serving: ${patientName}`;
    })
    .catch((error) => {
      console.error('Error serving patient:', error);
      alert('Failed to serve patient.');
    });
}

// Display the queue in real-time
db.collection('queue')
  .orderBy('createdAt')
  .onSnapshot((snapshot) => {
    const queueBody = document.getElementById('queueBody');
    queueBody.innerHTML = '';
    let queueNumber = 1; // Explicit counter to avoid NaN
    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${queueNumber}</td>
        <td>${data.name}</td>
        <td>${data.timeArrived}</td>
      `;
      queueBody.appendChild(row);
      queueNumber++;
    });
  }, (error) => {
    console.error('Error fetching queue:', error);
    alert('Failed to load queue.');
  });