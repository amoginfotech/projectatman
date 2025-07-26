// --- Firebase config ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_z0Px-dNmWENThAo0aB60imV8gSZTb38",
  authDomain: "projectatman-c82dc.firebaseapp.com",
  projectId: "projectatman-c82dc",
  storageBucket: "projectatman-c82dc.firebasestorage.app",
  messagingSenderId: "81544033645",
  appId: "1:81544033645:web:8cd9e1b079caf2f18c1664",
  measurementId: "G-G98T9TNS0R"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;
console.log('Firebase initialized with config:', firebaseConfig);

// --- Helper: get query param ---
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// --- Article creation with image and rich text (create.html) ---
if (document.getElementById('create-article-form')) {
  const quill = new Quill('#editor', { theme: 'snow' });
  
  // Error display element
  const errorDiv = document.createElement('div');
  errorDiv.id = 'form-error';
  errorDiv.className = 'alert alert-danger d-none mb-3';
  document.querySelector('#create-article-form').prepend(errorDiv);

  document.getElementById('create-article-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    errorDiv.classList.add('d-none');
    
    // Validate form
    const title = document.getElementById('title').value.trim();
    const content = quill.root.innerHTML;
    const author = document.getElementById('author').value.trim() || 'Anonymous';
    const category = document.getElementById('category').value.trim();
    const tags = window.getTags ? window.getTags() : []; // Use the tags from create.html
    
    if (!title) {
      showError('Title is required');
      document.getElementById('title').focus();
      return;
    }

    try {
      const imageFile = document.getElementById('image-upload').files[0];
      let imageUrl = '';
      
      if (imageFile) {
        const storageRef = firebase.storage().ref('article-images/' + Date.now() + '-' + imageFile.name);
        await storageRef.put(imageFile);
        imageUrl = await storageRef.getDownloadURL();
      }
      
      await db.collection('articles').add({
        title,
        content,
        author,
        category,
        tags,
        imageUrl,
        created: firebase.firestore.FieldValue.serverTimestamp()
      }).then(docRef => {
        window.location.href = 'index.html#article-' + docRef.id;
      });
    } catch (err) {
      showError(`Publishing failed: ${err.message}`);
      console.error('Article submission error:', err);
    }
  });
}

function showError(message) {
  const errorDiv = document.getElementById('form-error');
  errorDiv.innerHTML = message;
  errorDiv.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Home: List articles and add article ---
window.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('articles-list')) {
    // Expose a function to fetch articles from Firestore and call a callback with the array (fetch once)
    window.fetchArticles = function(callback) {
      console.log('Fetching articles from Firestore...');
      db.collection('articles').orderBy('created', 'desc').get().then(snapshot => {
        console.log('Articles fetched:', snapshot.size);
        const articles = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          articles.push({
            id: doc.id,
            title: data.title,
            author: data.author,
            content: data.content,
            contentPlain: data.content ? data.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') : '',
            imageUrl: data.imageUrl,
            created: data.created && data.created.toDate ? data.created.toDate().getTime() : (data.created ? data.created.seconds * 1000 : Date.now()),
            category: data.category || '',
            tags: data.tags || []
          });
        });
        if (typeof callback === 'function') callback(articles);
      }).catch(err => {
        console.error('Error fetching articles:', err);
        if (typeof callback === 'function') callback([]);
      });
    }
  }
});

// Article creation is now handled by the create-article-form with Quill editor above

// --- Article page: Show article, comments, add comment ---
if (document.getElementById('article-content')) {
  const id = getQueryParam('id');
  if (id) {
    db.collection('articles').doc(id).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        let img = data.imageUrl ? `<img src="${data.imageUrl}" alt="" style="max-width:300px;display:block;margin-bottom:1em;">` : '';
        document.getElementById('article-content').innerHTML = `${img}<h2>${data.title}</h2><p>by ${data.author}</p><div>${data.content}</div>`;
      }
    });
    // Load comments
    db.collection('articles').doc(id).collection('comments').orderBy('created').onSnapshot(snapshot => {
      const list = document.getElementById('comments-list');
      list.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<strong>${data.author}</strong>: ${data.text}`;
        list.appendChild(div);
      });
    });
    // Add comment
    document.getElementById('comment-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const author = document.getElementById('comment-author').value;
      const text = document.getElementById('comment-text').value;
      db.collection('articles').doc(id).collection('comments').add({
        author, text,
        created: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        document.getElementById('comment-form').reset();
      });
    });
  }
}
