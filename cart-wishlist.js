const CART_KEY = "liplush-cart";
const WISHLIST_KEY = "liplush-wishlist";

function readItems(key) {
    const storedItems = localStorage.getItem(key);
    if (storedItems === null) {
        return [];
    }

    const items = JSON.parse(storedItems);
    if (!Array.isArray(items)) {
        throw new Error(`Stored data for ${key} must be a list.`);
    }
    return items;
}

function saveItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
}

function getProduct(card) {
    const image = card.querySelector("img");
    const name = card.querySelector("h3");
    return {
        id: image.getAttribute("src"),
        image: image.getAttribute("src"),
        imageAlt: image.alt,
        name: name.textContent.trim()
    };
}

function addToCart(product) {
    const items = readItems(CART_KEY);
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        items.push({ ...product, quantity: 1 });
    }
    saveItems(CART_KEY, items);
}

function addToWishlist(product) {
    const items = readItems(WISHLIST_KEY);
    if (!items.some((item) => item.id === product.id)) {
        items.push(product);
        saveItems(WISHLIST_KEY, items);
    }
}

function createButton(label, className, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function addProductActions() {
    document.querySelectorAll(".product-card").forEach((card) => {
        const actions = document.createElement("div");
        actions.className = "product-actions";
        const status = document.createElement("p");
        status.className = "product-status";
        status.setAttribute("aria-live", "polite");

        actions.append(
            createButton("Add to cart", "button button-primary", () => {
                addToCart(getProduct(card));
                status.textContent = "Added to cart.";
            }),
            createButton("Add to wishlist", "button button-secondary", () => {
                addToWishlist(getProduct(card));
                status.textContent = "Added to wishlist.";
            })
        );
        card.append(actions, status);
    });
}

function createSavedProductCard(item, onRemove, includeCartAction) {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.imageAlt;
    const name = document.createElement("h3");
    name.textContent = item.name;
    card.append(image, name);

    if (typeof item.quantity === "number") {
        const quantity = document.createElement("p");
        quantity.className = "cart-quantity";
        quantity.textContent = `Quantity: ${item.quantity}`;
        card.append(quantity);
    }

    const actions = document.createElement("div");
    actions.className = "product-actions";
    if (includeCartAction) {
        actions.append(createButton("Add to cart", "button button-primary", () => {
            addToCart(item);
            renderSavedProducts();
        }));
    }
    actions.append(createButton("Remove", "button button-secondary", onRemove));
    card.append(actions);
    return card;
}

function renderSavedProducts() {
    const cartGrid = document.getElementById("cart-items");
    const wishlistGrid = document.getElementById("wishlist-items");

    if (cartGrid) {
        const cartItems = readItems(CART_KEY);
        cartGrid.replaceChildren(...cartItems.map((item) =>
            createSavedProductCard(item, () => {
                saveItems(CART_KEY, cartItems.filter((savedItem) => savedItem.id !== item.id));
                renderSavedProducts();
            }, false)
        ));
        document.getElementById("cart-empty").hidden = cartItems.length > 0;
    }

    if (wishlistGrid) {
        const wishlistItems = readItems(WISHLIST_KEY);
        wishlistGrid.replaceChildren(...wishlistItems.map((item) =>
            createSavedProductCard(item, () => {
                saveItems(WISHLIST_KEY, wishlistItems.filter((savedItem) => savedItem.id !== item.id));
                renderSavedProducts();
            }, true)
        ));
        document.getElementById("wishlist-empty").hidden = wishlistItems.length > 0;
    }
}

addProductActions();
renderSavedProducts();
