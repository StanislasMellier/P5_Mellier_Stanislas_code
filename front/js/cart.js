// Regarde sur quelle page se trouve l'utilisateur et exécute le code approprié 
if (document.URL.includes('cart')) {
    LoadCartPage();
} else if (document.URL.includes('confirmation')) {
    LoadConfirmationPage();
}

// Code a exécuter si l'utilisateur est sur la page du panier
function LoadCartPage() {
    var cart = JSON.parse(localStorage.getItem('cart')); // Récupère le panier de l'utilisateur
    var itemContainer = document.querySelector('#cart__items'); // Sélectionne la section où le panier sera affiché
    // Pour chaque Produits dans le panier on execute la fonction BuildCartItem 
    for (let i in cart) {
        BuildCartItem(cart[i]);
    }
    // Crée la balise article html et y insere les détail du produit
    async function BuildCartItem(cartItem) {
        var Item = document.createElement('article');
        var ProductDetail = await getProductDetail(cartItem.id);
        Item.setAttribute('data-id',cartItem.id);
        Item.setAttribute('data-color',cartItem.color);
        Item.className ='cart__item';
        Item.innerHTML = `
        <div class="cart__item__img">
            <img src=${ProductDetail.imageUrl} alt=${ProductDetail.altTxt}>
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${ProductDetail.name}</h2>
                <p>${cartItem.color}</p>
                <p><span class="price">${ProductDetail.price}</span> €</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qté : </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value=${cartItem.quantity}>
                </div>
                <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Supprimer</p>
                </div>
            </div>
        </div>`;
        
        // Ecoute si l'utilisateur clique sur le bouten "Supprimer"
        var deleteItem = Item.querySelector('.deleteItem');
        deleteItem.addEventListener('click',function() {
            DeleteItemFromCart(Item); // Exécute la fonction permettant de supprimer le produit du panier
            TotalCart(); // Mets à jour le total
        });

        // Ecoute si l'utilisateur change la quantité du produit
        var itemQuantity = Item.querySelector('.itemQuantity');
        itemQuantity.addEventListener('change',function(e) {
            ChangeItemQuantityFromCart(Item, e.target.value); // Exécute la fonction permettant de modifier la quantité du produit dans le panier
            TotalCart(); // Mets à jour le total
        });

        itemContainer.appendChild(Item);
        TotalCart(); // Mets à jour le total
    };

    // Récupère la position du produit dans le panier
    function GetItemPosInCart(id,color) {
        var IsInCart = false;
        var PosInCart = 0;
        while (IsInCart == false && PosInCart < cart.length) {
            if (cart[PosInCart].id == id && cart[PosInCart].color == color) {
                IsInCart = true;
            } else {PosInCart++}
        }
        if (IsInCart) {
            return PosInCart; // Retourne la position du produit
        } else {
            return false; // Retourne false si le produit n'est pas dans le panier
        }
    };

    // Supprime le produit demander du panier
    function DeleteItemFromCart(Item) {
        var PosInCart = GetItemPosInCart(Item.dataset.id,Item.dataset.color); // Récupère la position du produit
        if (typeof PosInCart == 'boolean' && PosInCart == false) {
            console.error('Item not in cart'); // Si le produit n'est pas dans le panier affiche une erreur
        }
        itemContainer.removeChild(Item); // Supprime le produit de la page html
        // Supprime le produit du panier
        cart.splice(PosInCart,1);
        localStorage.setItem('cart',JSON.stringify(cart));
    };
    // Change la quantité du produit dans le panier
    function ChangeItemQuantityFromCart(Item,quantity) {
        var PosInCart = GetItemPosInCart(Item.dataset.id,Item.dataset.color); // Récupère la position du produit
        if (typeof PosInCart == 'boolean' && PosInCart == false) {
            console.error('Item not in cart'); // Si le produit n'est pas dans le panier affiche une erreur
        }
        // Change la quantité du produit dans le panier
        cart[PosInCart].quantity = parseInt(quantity);
        localStorage.setItem('cart',JSON.stringify(cart));
    };

    // Récupère les détails d'un produit depuis son id 
    async function getProductDetail(id) {
        var data = await fetch(`http://localhost:3000/api/products/${id}`)
        .then(function(res) {
            return res.json()
        })
        .catch(function(err) {
            console.error(err)
        });
        return data; // Retourne les détails du produit
    };
    
    // Calcule le prix et la quantité total du panier
    function TotalCart() {
        var TotalPrice = document.querySelector('#totalPrice');
        var TotalQuantity = document.querySelector('#totalQuantity');
        var totalP = 0;
        var totalQ = 0;
        // Calcule pour chaque produit le prix et récupère la quantité puis l'ajoute au total 
        for(var i = 0; i < itemContainer.children.length; i++) {
            var price = parseInt(itemContainer.children[i].querySelector('.price').innerText);
            var quantity = parseInt(itemContainer.children[i].querySelector('.itemQuantity').value);
            totalP += price*quantity;
            totalQ += quantity;
    
        }
        // Remplace le total par le résultat de la fonction
        TotalPrice.innerText = totalP;
        TotalQuantity.innerText = totalQ;
    };
    
    // Récupère les input du formulaire
    const FormFirstName = document.querySelector('#firstName');
    const FormLastName = document.querySelector('#lastName');
    const FormAddress = document.querySelector('#address');
    const FormCity = document.querySelector('#city');
    const FormEmail = document.querySelector('#email');
    const OrderBtn = document.querySelector('#order');
    
    // Récupère les balises associées à chaque input du formulaire
    const firstNameErrorMsg = document.querySelector('#firstNameErrorMsg');
    const lastNameErrorMsg = document.querySelector('#lastNameErrorMsg');
    const addressErrorMsg = document.querySelector('#addressErrorMsg');
    const cityErrorMsg = document.querySelector('#cityErrorMsg');
    const emailErrorMsg = document.querySelector('#emailErrorMsg');
    
    // Défini les RegEx utiliser pour vérifier le contenu du formulaire
    const nameRegex = /^[a-zA-Zàâäéèêëïîôöùûüç '-]+$/;
    const adressRegex = /^[0-9]{1,3}(?:(?:[,. ])+[-a-zA-Zàâäéèêëïîôöùûüç'-]+)+$/;
    const cityRegex = /^(?:[-a-zA-Zàâäéèêëïîôöùûüç ,'-]+)$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    // Vérifie si les données entrer dans le formulaire sont correct
    function FormValidation(contact) {
        var IsValid = true;
        
        // Verifie si le Prenom est valide
        if (IsEmpty(contact.firstName)) {
            firstNameErrorMsg.innerText = 'Le champ est vide';
            IsValid = false;
        } else if (nameRegex.test(contact.firstName) == false) {
            firstNameErrorMsg.innerText = 'Prénom invalide , un prénom ne doit pas contenir de chiffre ni de caractères spéciaux';
            IsValid = false;
        } else {
            firstNameErrorMsg.innerText = '';
        }
        // Verifie si le Nom est valide
        if (IsEmpty(contact.lastName)) {
            lastNameErrorMsg.innerText = 'Le champ est vide';
            IsValid = false;
        } else if (nameRegex.test(contact.lastName) == false) {
            lastNameErrorMsg.innerText = 'Nom invalide, un nom ne doit pas contenir de chiffre ni de caractères spéciaux';
            IsValid = false;
        } else {
            lastNameErrorMsg.innerText = '';
        }
        // Verifie si l'adresse est valide
        if (IsEmpty(contact.address)) {
            addressErrorMsg.innerText = 'Le champ est vide';
            IsValid = false;
        } else if (adressRegex.test(contact.address) == false) {
            addressErrorMsg.innerText = 'Adresse invalide, l\'adresse doit commencer par le numéro d\'adresse suivit par du nom de l\'adresse et ne doit pas contenir de caractères spéciaux';
            IsValid = false;
        } else {
            addressErrorMsg.innerText = '';
        }
        // Verifie si la ville est valide
        if (IsEmpty(contact.city)) {
            cityErrorMsg.innerText = 'Le champ est vide';
            IsValid = false;
        } else if (cityRegex.test(contact.city) == false) {
            cityErrorMsg.innerText = 'Ville invalide, La vill';
            IsValid = false;
        } else {
            cityErrorMsg.innerText = '';
        }
        // Verifie si le mail est valide
        if (IsEmpty(contact.email)) {
            emailErrorMsg.innerText = 'Le champ est vide';
            IsValid = false;
        } else if (emailRegex.test(contact.email) == false) {
            emailErrorMsg.innerText = 'Email invalide';
            IsValid = false;
        } else {
            emailErrorMsg.innerText = '';
        }
        return IsValid;
    };
    // Vérifie si la valeur est un string vide
    function IsEmpty(value) {
        if (!value == null || !value == undefined || value.length <= 0) {
            return true;
        } else {
            return false;
        }
    };

    // Ecoute si l'utilisateur clique sur Commander
    OrderBtn.addEventListener('click', function(e) {
        // Empêche le bouton d'actualiser la page
        e.preventDefault()
        // Construit l'objet Contact 
        var contact = {
            firstName : FormFirstName.value,
            lastName : FormLastName.value,
            address : FormAddress.value,
            city : FormCity.value,
            email : FormEmail.value,
        }
        // Vérifie si les données son correct et retourne false si incorrect
        if (FormValidation(contact) == false) {
            return false;
        }
        // Récupère l'id de chaque produits du panier et l'ajoute a l'objet products
        var products = []
        for (let i in cart){
            products.push(cart[i].id)
        }

        var req = {
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({contact,products})
        }

        // Effectue Une Requete POST et envoie les données du formulaire et le panier au serveur
        fetch('http://localhost:3000/api/products/order', req).then(res => {
            return res.json();
        })
        .then(value => {
            // Renvoie l'utilisateur sur la page de confirmation
            window.location.href = `confirmation.html?orderId=${value.orderId}`;
            // Supprime le panier
            localStorage.removeItem('cart');
        })
        .catch(function(err) {
            console.error(err)
        });
    });
};

// Code a exécuter si l'utilisateur est sur la page de confirmation
function LoadConfirmationPage() {
    // Récupère l'id de la commande
    var url = new URL(document.location.href);
    const orderId = url.searchParams.get('orderId');
    // Affiche l'id de la commande sur la page
    document.querySelector('#orderId').innerText = orderId;
};


