window.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded in articles-list.js');
  
  const articlesListDiv = document.getElementById('articles-list');
  const latestArticlesSidebar = document.getElementById('latest-articles-sidebar');

  // Display loading spinners
  if (articlesListDiv) {
    articlesListDiv.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading articles...</span>
        </div>
        <p class="mt-2">Loading articles...</p>
      </div>
    `;
  }
  if (latestArticlesSidebar) {
    latestArticlesSidebar.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading latest...</span>
        </div>
      </div>
    `;
  }

  // Ensure window.fetchArticles is available (it should be exposed by main.js)
  if (typeof window.fetchArticles === 'function') {
    window.fetchArticles(function(articles) {
      console.log('Articles received:', articles.length);

      if (!articles.length) {
        if (articlesListDiv) {
          articlesListDiv.innerHTML = '<div class="col-12"><div class="alert alert-warning">No articles found.</div></div>';
        }
        if (latestArticlesSidebar) {
          latestArticlesSidebar.innerHTML = '<p class="text-muted">No latest articles.</p>';
        }
        return;
      }

      // Render main articles list (cards)
      if (articlesListDiv) {
        articlesListDiv.innerHTML = ''; // Clear loading spinner
        articles.forEach(article => {
          const dateStr = article.created ? new Date(article.created).toLocaleDateString() : '';
          const cardHtml = `
            <div class="col-md-6 col-lg-4">
              <div class="card h-100 shadow-sm blog-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" class="card-img-top" alt="Article Image">` : ''}
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title"><a href="article.html?id=${article.id}" class="text-decoration-none text-dark">${article.title}</a></h5>
                  <p class="card-text text-muted"><small>By ${article.author || 'Unknown'} on ${dateStr}</small></p>
                  <p class="card-text">${article.contentPlain.substring(0, 150)}...</p>
                  <div class="mt-auto">
                    <a href="article.html?id=${article.id}" class="btn btn-primary btn-sm">Read More</a>
                  </div>
                </div>
              </div>
            </div>
          `;
          articlesListDiv.innerHTML += cardHtml;
        });
      }

      // Render latest articles sidebar
      if (latestArticlesSidebar) {
        latestArticlesSidebar.innerHTML = ''; // Clear loading spinner
        // Take top 5 latest articles for sidebar
        articles.slice(0, 5).forEach(article => {
          const sidebarItem = `
            <div class="mb-2">
              <a href="article.html?id=${article.id}" class="text-decoration-none">${article.title}</a>
              <p class="text-muted mb-0"><small>By ${article.author || 'Unknown'}</small></p>
            </div>
          `;
          latestArticlesSidebar.innerHTML += sidebarItem;
        });
      }
    });
  } else {
    console.error('window.fetchArticles is not defined. Ensure main.js is loaded correctly.');
    if (articlesListDiv) {
      articlesListDiv.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading articles. Please check console.</div></div>';
    }
  }
});
