function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const button = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!')
  button.addEventListener('click', moveItemToCart);
  section.appendChild(button);


  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  event.target.remove();
  updateLocalStorage()
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.data = { sku, name, salePrice };
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function moveItemToCart(event) {
  fetch('https://api.mercadolibre.com/items/' + getSkuFromProductItem(event.target.parentElement))
    .then(response => response.json())
    .then(data => {
      const { id, title, price } = data;

      const productItem = createCartItemElement({ sku: id, name: title, salePrice: price });
      const productsContainer = document.querySelector('.cart__items');
      productsContainer.appendChild(productItem);
      updateItemsState()
    });
}

function emptyCart() {
  const button = document.querySelector('.empty-cart');
  const cart = document.querySelector('.cart__items');
  button.addEventListener('click', () => {
    cart.innerHTML = '';
    updateItemsState();
  });

}

function getProducts() {
  const productsContainer = document.querySelector('.items');
  let loader = `<div class="loading">Loading...</div>`;
  productsContainer.innerHTML = loader;

  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then(response => response.json())
    .then(data => {
      const products = data.results;
      productsContainer.innerHTML = '';

      products.forEach(product => {
        const { id, title, thumbnail } = product;
        const productItem = createProductItemElement({ sku: id, name: title, image: thumbnail });
        productsContainer.appendChild(productItem);
      });
    });
}

function updateLocalStorage() {
  const cart = document.querySelector('.cart__items');
  const items = cart.querySelectorAll('li');
  const itemsArray = Array.from(items);
  const itemsObject = itemsArray.map(item => {
    const itemObject = {};
    itemObject.sku = item.data.sku;
    itemObject.name = item.data.name;
    itemObject.salePrice = item.data.salePrice;
    return itemObject;
  });
  localStorage.setItem('items', JSON.stringify(itemsObject));
}

function getLocalStorage() {
  const cart = document.querySelector('.cart__items');
  const items = JSON.parse(localStorage.getItem('items'));
  items?.forEach(item => {
    const productItem = createCartItemElement(item);
    cart.appendChild(productItem);
  });
}

function updateTotalPrice() {
  const cart = document.querySelector('.cart__items');
  const items = Array.from(cart.querySelectorAll('li'));
  let totalPrice = 0
  items.forEach(item => {
    totalPrice += item.data.salePrice;
  });
  const totalPriceElement = document.querySelector('.total-price');
  totalPriceElement.innerText = `Total: $${totalPrice}`;
}

function updateItemsState() {
  updateTotalPrice()
  updateLocalStorage()
}

window.onload = () => {
  getLocalStorage()
  getProducts()
  emptyCart()
};
