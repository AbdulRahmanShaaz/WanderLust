const deleteForm = document.querySelector('[data-delete-form]');
const deleteModal = document.querySelector('[data-delete-modal]');
const cancelDeleteButton = document.querySelector('[data-cancel-delete]');
const confirmDeleteButton = document.querySelector('[data-confirm-delete]');
const reviewForm = document.querySelector('[data-review-form]');
const listingMapElement = document.getElementById('listing-map');

if (listingMapElement && window.listingCoordinates) {
  const lng = window.listingCoordinates[0];
  const lat = window.listingCoordinates[1];

  const map = L.map('listing-map', {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([lat, lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #ff385c 0%, #e31c5f 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 8px 20px rgba(227, 28, 95, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  });

  L.marker([lat, lng], { icon: customIcon }).addTo(map);
}

if (deleteForm && deleteModal && cancelDeleteButton && confirmDeleteButton) {
  const closeModal = () => {
    deleteModal.hidden = true;
  };

  deleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    deleteModal.hidden = false;
    confirmDeleteButton.focus();
  });

  cancelDeleteButton.addEventListener('click', closeModal);

  deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !deleteModal.hidden) {
      closeModal();
    }
  });

  confirmDeleteButton.addEventListener('click', () => {
    deleteForm.submit();
  });
}

if (reviewForm) {
  const ratingInputs = reviewForm.querySelectorAll('input[name="review[rating]"]');
  const commentInput = reviewForm.querySelector('textarea[name="review[comment]"]');

  reviewForm.addEventListener('submit', (event) => {
    const selectedRating = reviewForm.querySelector('input[name="review[rating]"]:checked');
    const ratingValue = selectedRating ? Number(selectedRating.value) : 0;
    const comment = commentInput ? commentInput.value.trim() : '';

    if (ratingValue < 1 || ratingValue > 5) {
      event.preventDefault();
      ratingInputs[1]?.focus();
      return;
    }

    if (comment.length < 5) {
      event.preventDefault();
      commentInput?.focus();
    }
  });
}
