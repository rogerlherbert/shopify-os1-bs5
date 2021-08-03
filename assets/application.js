// Put your application javascript here

function Cart() {
  this.data = {};

  this.cartItemElements = [];

  this.init = () => {
    Shopify.theme.cart.getState()
      .then(state => {
        this.data = state;
      });

    let cartUpdateButtonEl = document.querySelector('.cart__updater');
    cartUpdateButtonEl.classList.add('d-none');

    this.cartItemElements = document.querySelectorAll('.xx-cart-item');

    for(let i=0; i < this.cartItemElements.length; i++) {
      qty_el = this.cartItemElements[i].querySelector('.xx-cart-item__qty');
      qty_el.addEventListener('change', this.changeItemQuantity);
    }
  };

  this.changeItemQuantity = (event) => {
    if (event.target.validity.valid === true) {

      let cartItemEl = event.target.closest('.xx-cart-item');
      let itemPriceEl = cartItemEl.querySelector('.xx-cart-item__price');

      let key = cartItemEl.dataset.itemKey;
      let quantity = Number(event.target.value);

      Shopify.theme.cart.updateItem(key, { quantity }).then(state => {
        this.data = state;
        console.log(state);

        let updatedItem = state.items.find(item => item.key === key);

        // format as money
        itemPriceEl.textContent = this.formatMoney(updatedItem.final_line_price);
        itemPriceEl.classList.add('text-success');

        // update summary block
        let cartSubtotalEl = document.querySelector('.cart__subtotal');
        cartSubtotalEl.textContent = this.formatMoney(state.items_subtotal_price);
        cartSubtotalEl.classList.add('text-success');
      });
    }
  };

  // adapted from https://github.com/Shopify/theme-scripts
  this.formatMoney = (cents, format = '€{{amount_no_decimals_with_comma_separator}}') => {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format;

    function formatWithDelimiters(
      number,
      precision = 2,
      thousands = ',',
      decimal = '.'
    ) {
      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      const parts = number.split('.');
      const dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        `$1${thousands}`
      );
      const centsAmount = parts[1] ? decimal + parts[1] : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  let cart = new Cart();

  cart.init();

  let spinnerEl = document.createElement('span');
  spinnerEl.setAttribute('class', 'spinner-border spinner-border-sm');
  spinnerEl.setAttribute('role', 'status');
  spinnerEl.setAttribute('aria-hidden', 'true');

  let buttonArr = document.querySelectorAll('.btn:not(.dropdown-toggle, [data-bs-target], .klaviyo-bis-trigger)');

  buttonArr.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.replaceChildren(spinnerEl);
    });
  });
});
