function removeCartElement() {
    this.parentNode.remove();
    saveSessionCart();
    setCartTotal();
}

const cartContainerElement = document.querySelector('.cart');
const menuContainerElement = document.querySelector('.navmenu');

function addCartElement(event, productJSON = null) {    
    let productId = productJSON === null ? this.parentNode.querySelector('.product-price').getAttribute('data-id') : productJSON.id;
    let productCount = Array.from(cartContainerElement.querySelectorAll('.cart-product')).filter(c => c.getAttribute('data-id') === productId).length;

    if (productJSON !== null || productCount === 0) {
        const newElementContainer = createCartElement('div', productJSON, this, '.product-price');
        const newElementCount = createCartElement('span', productJSON);
        const newElementImage = createCartElement('img', productJSON, this, '.product-image');
        const newElementTittle = createCartElement('p', productJSON, this, '.product-title');
        const newElementPrice = createCartElement('p', productJSON, this, '.product-price');
        const newElementDelete = createCartElement('i', productJSON);
        newElementDelete.addEventListener('click', removeCartElement);
        newElementContainer.append(newElementCount, newElementImage, newElementTittle, newElementPrice, newElementDelete);
        cartContainerElement.append(newElementContainer);
    } else {
        let cartProductCountElement = cartContainerElement.querySelector(`div.cart-product[data-id='${productId}'] > span.cart-product-count`);
        let addedProductCount = Number.parseInt(cartProductCountElement.textContent)+1;
        cartProductCountElement.textContent = addedProductCount;

        let cartProductPriceElement = cartContainerElement.querySelector(`div.cart-product[data-id='${productId}'] > p.cart-product-price`);
        cartProductPriceElement.setAttribute('data-count', addedProductCount);
    }

    if (productJSON === null) {
        saveSessionCart();
    }

    setCartTotal();
}

const toggleCartContainer = () => { 
    cartContainerElement.classList.toggle('show-right');
    if (window.screen.availHeight <= 890 && cartContainerElement.className === 'cart show-right' && menuContainerElement.className === 'navmenu show-left') {
        menuContainerElement.classList.remove('show-left');
    }
};

const toggleMenuContainer = () => {
    menuContainerElement.classList.toggle('show-left');
    if (window.screen.availHeight <= 890 && cartContainerElement.className === 'cart show-right' && menuContainerElement.className === 'navmenu show-left') {
        cartContainerElement.classList.remove('show-right');
    }
}

document.getElementById('cartIcon').addEventListener('click', toggleCartContainer);
document.querySelector('.close-cart').addEventListener('click', toggleCartContainer);

document.getElementById('menuIcon').addEventListener('click', toggleMenuContainer);
document.querySelector('.close-menu').addEventListener('click', toggleMenuContainer);

const createCartElement = (elementType, productJSON = null, context = undefined, querySelector = undefined) => {
    const newElement = document.createElement(elementType);
    switch(elementType) {
        case 'div': {
            newElement.className = 'cart-product';
            let productId = productJSON === null ? context.parentNode.querySelector(querySelector).getAttribute('data-id') : productJSON.id;
            newElement.setAttribute('data-id', productId);
            break;
        }
        case 'img':
            let productImageSrc = productJSON === null ? context.parentNode.querySelector(querySelector).getAttribute('src') : productJSON.image;
            newElement.setAttribute('src', productImageSrc);
            newElement.className = 'cart-product-image';
          break;
        case 'p':           
            if (querySelector === '.product-price') {
                newElement.textContent = productJSON === null ? context.parentNode.querySelector(querySelector).textContent : productJSON.price;
                let amount = productJSON === null ? formatAmount(newElement.textContent) : productJSON.price;
                newElement.setAttribute('data-price', amount);
                newElement.className = 'cart-product-price';
                let productCount = productJSON === null ? '1' : productJSON.count;
                newElement.setAttribute('data-count', productCount);
            } else {
                newElement.textContent = productJSON === null ? context.parentNode.querySelector(querySelector).textContent : productJSON.title;
                newElement.className = 'cart-product-title';
            }
          break;
        case 'i':
            const deleteElement = document.createElement('img');
            deleteElement.setAttribute('src', 'img/remove.png');
            deleteElement.setAttribute('alt', 'Icono de remover producto del carrito');
            deleteElement.className = 'delete-icon';
            newElement.append(deleteElement);
            break;
        case 'span' :
            newElement.className = 'cart-product-count';
            newElement.textContent = productJSON === null ? '1' : productJSON.count;
            break;
        default:
            console.error(`El paramentro ${elementType} no es valido`);
      }
    return newElement;
}

document.querySelectorAll('.add-cart').forEach(addButton => {
    addButton.addEventListener('click', addCartElement);
});

const formatCurrency = (amount) => (new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'})).format(amount);
const formatAmount = (currencyAmount) => currencyAmount.substring(1).split(',').join('');

const setCartTotal = () => {
    let cartCount = 0;
    cartContainerElement.querySelectorAll('div.cart-product > span.cart-product-count').forEach(c => {cartCount += Number.parseInt(c.textContent)});
    let cartAmount = 0;
    document.querySelectorAll('.cart-product-price').forEach(c => { cartAmount += parseFloat(c.getAttribute('data-price')) * parseInt(c.getAttribute('data-count')) });
    document.querySelector('.cart-count').textContent = cartCount < 10 ? `0${cartCount}`: cartCount;
    document.querySelector('.cart-empty').style.display = cartCount > 0 ? 'none' : 'block';
    document.querySelector('.cart-total').style.display = cartCount > 0 ? 'flex' : 'none';
    document.querySelector('.cart-amount').textContent = formatCurrency(cartAmount);
}

const saveSessionCart = () => {
    let cartJSON = '[';
    document.querySelectorAll('.cart-product').forEach(product => {
        cartJSON += `{"id":"${product.getAttribute('data-id')}",`;
        Array.from(product.children).forEach(c => {
            switch (c.className) {
                case 'cart-product-image':
                    cartJSON += `"image":"${c.getAttribute('src')}",`; 
                break;
                case 'cart-product-title':
                    cartJSON += `"title":"${c.textContent}",`; 
                break;
                case 'cart-product-price':
                    cartJSON += `"count":"${c.getAttribute('data-count')}",`; 
                    cartJSON += `"price":"${c.getAttribute('data-price')}",`; 
                break;
                default:
                break;
            }
        });
        cartJSON = cartJSON.substring(0,cartJSON.length-1);
        cartJSON+=`},`;
    });
    cartJSON = cartJSON.substring(0,cartJSON.length-1);
    cartJSON += ']';
    sessionStorage.setItem('cart', cartJSON);
}

const setCartFromSession = () => {
    let sessionCart = sessionStorage.getItem('cart');
    if (sessionCart !== null) {
        let cartJSON = JSON.parse(sessionCart);
        for (cartProduct of cartJSON) {
            addCartElement(null, cartProduct);
        }
    }
}

setCartFromSession();