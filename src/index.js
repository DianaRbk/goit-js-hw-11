import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';

const lightbox = new SimpleLightbox('.gallery a');

let page = 1;
const perPage = 40;
const API_KEY = '37495398-df49a33162ea2f4df9b7dd0ab';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: perPage,
      },
    });

    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      showNotification('failure', 'Sorry, there are no images matching your search query. Please try again.');
    } else {
      const gallery = document.querySelector('.gallery');

      if (page === 1) {
        clearGallery();
        lightbox.refresh();
      }

      hits.forEach((image) => {
        const card = createPhotoCard(image);
        gallery.appendChild(card);
      });

      lightbox.refresh();

      if (totalHits <= page * perPage) {
        hideLoadMoreButton();
        showNotification('info', "We're sorry, but you've reached the end of search results.");
      } else {
        showLoadMoreButton();
      }

      page++;
      showNotification('success', `Hooray! We found ${totalHits} images.`);
    }
  } catch (error) {
    showNotification('failure', 'Oops! Something went wrong. Please try again later.');
  }
}

function createPhotoCard(image) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const link = document.createElement('a');
  link.href = image.largeImageURL;

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'info';

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  link.appendChild(img);
  card.appendChild(link);
  card.appendChild(info);

  return card;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.className = 'info-item';
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}

function clearGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more');
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more');
  loadMoreBtn.style.display = 'none';
}

function showNotification(type, message) {
  Notiflix.Notify[type](message);
}

// Event listeners
document.querySelector('#search-form').addEventListener('submit', handleFormSubmit);
document.querySelector('.load-more').addEventListener('click', handleLoadMoreClick);

async function handleFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    showNotification('failure', 'Please enter a search query.');
    return;
  }

  page = 1;
  await fetchImages(searchQuery);
  scrollGallery();
}

async function handleLoadMoreClick() {
  const searchQuery = document.querySelector('#search-form input[name="searchQuery"]').value.trim();

  if (searchQuery === '') {
    showNotification('failure', 'Please enter a search query.');
    return;
  }

  await fetchImages(searchQuery);
  scrollGallery();
}

