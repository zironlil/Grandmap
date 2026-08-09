const map = L.map('map', { crs: L.CRS.Simple, minZoom: 1, maxZoom: 4 });
const imageUrl = 'map.jpg';
const imageBounds = [[0, 0], [1000, 1000]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    renderHouses(data.houses);
    renderBusinesses(data.businesses);
  })
  .catch(err => console.error('Ошибка загрузки JSON:', err));

function renderHouses(houses) {
  houses.forEach(house => {
    const marker = createHouseMarker(house);
    marker.addTo(map);
    marker.on('click', () => showDetails(house, 'house'));
  });
}

function createHouseMarker(house) {
  const color = house.status === 'free' ? '#4caf50' : '#f44336';
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background:${color}; width:32px; height:32px; border-radius:8px; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
  return L.marker([house.y, house.x], { icon }).bindPopup(house.name);
}

function renderBusinesses(businesses) {
  businesses.forEach(biz => {
    const marker = L.marker([biz.y, biz.x]).bindPopup(biz.type);
    marker.addTo(map);
    marker.on('click', () => showDetails(biz, 'business'));
  });
}

function showDetails(obj, type) {
  const panel = document.getElementById('details-panel');
  const nameEl = document.getElementById('obj-name');
  const detailsEl = document.getElementById('obj-details');
  panel.classList.remove('hidden');
  nameEl.textContent = obj.name;
  detailsEl.innerHTML = '';

  if (type === 'house') {
    detailsEl.innerHTML += `
      <div class="detail-row"><span class="detail-label">Статус:</span>${obj.status === 'free' ? 'Свободен' : 'Занят'}</div>
      <div class="detail-row"><span class="detail-label">Владелец:</span>${obj.owner}</div>
      <div class="detail-row"><span class="detail-label">Форма:</span>${obj.shape}</div>
      <hr style="border:0; border-top:1px solid #eee; margin:12px 0;">
      <div class="detail-row" style="font-weight:bold">Подъезды и квартиры:</div>
    `;
    for (const entrance in obj.apartments) {
      const entBlock = document.createElement('div');
      entBlock.className = 'detail-row';
      entBlock.innerHTML = `<b>${entrance}</b><br>`;
      for (const floor in obj.apartments[entrance]) {
        entBlock.innerHTML += `${floor}: ${obj.apartments[entrance][floor].join(', ')}<br>`;
      }
      detailsEl.appendChild(entBlock);
    }
  } else if (type === 'business') {
    detailsEl.innerHTML += `
      <div class="detail-row"><span class="detail-label">Тип:</span>${obj.type}</div>
      <div class="detail-row"><span class="detail-label">Владелец:</span>${obj.owner}</div>
    `;
    if (obj.prices.frames !== undefined) {
      detailsEl.innerHTML += `<div class="detail-row"><span class="detail-label">Рамки:</span>${obj.prices.frames} ₽</div>`;
    }
    if (obj.prices.markup !== undefined) {
      detailsEl.innerHTML += `<div class="detail-row"><span class="detail-label">Наценка:</span>${obj.prices.markup}%</div>`;
    }
    if (obj.prices.spawn !== undefined) {
      detailsEl.innerHTML += `<div class="detail-row"><span class="detail-label">Цена спавна:</span>${obj.prices.spawn} ₽</div>`;
    }
  }
}

document.getElementById('close-panel').addEventListener('click', () => {
  document.getElementById('details-panel').classList.add('hidden');
});
    
