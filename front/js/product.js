// Récupère les éléments html requis 
var ProductImg = document.querySelector('.item__img');
var ProductName = document.querySelector('#title');
var ProductPrice = document.querySelector('#price');
var ProductDesc = document.querySelector('#description');
var ProductSelectColor = document.querySelector('#colors');
var addToCartBtn = document.querySelector('#addToCart')
// Récupère l'id du produit dans l'Url
var url = new URL(document.location.href);
var ProductId = url.searchParams.get('id');


// Récupère les détail du produit 
fetch(`http://localhost:3000/api/products/${ProductId}`)
.then(function(res) { 
    return res.json();
})
.then(function(value) {
    InsertProductDetailInPage(value)
})
.catch(function(err) {
    console.error(err)
});

// Insert les détails du produit dans la page
function InsertProductDetailInPage(detail) {
    // Change le titre de la page
    document.title = detail.name;
    // Créer l'image du produit avec ses attribut
    let img = document.createElement('img');
    img.setAttribute('src',detail.imageUrl);
    img.setAttribute('alt', detail.altTxt);
    ProductImg.append(img);
    // Insert les détails du produit dans la pages
    ProductName.innerText = detail.name;
    ProductPrice.innerText = detail.price;
    ProductDesc.innerText = detail.description;
    // Insert les possibilités de couleurs du produit
    for(let i in detail.colors) {
        var option = document.createElement('option');
        option.innerText = detail.colors[i];
        option.setAttribute('value',detail.colors[i]);
        ProductSelectColor.append(option);
    }
}
// Regarde si un produit avec le même id et la même couleurs est déjà présent dans le panier
function IsItemAlreadyInCart(item,cart) {
    var IsInCart = false;
    let PosInCart = 0;
    while (IsInCart == false && PosInCart < cart.length) {
        if (cart[PosInCart].id == item.id && cart[PosInCart].color == item.color) {
            IsInCart = true;
            console.log('item in cart',IsInCart,PosInCart);
        } else {
            PosInCart++;
        }
        console.log(PosInCart);
    }
    // Retourne si le produit est dans le panier et sa position (retourne 0 si n'est pas dans le panier)
    return {IsInCart,PosInCart};
}
// Ecoute si le Bouton "Ajouter au panier" est cliqué
addToCartBtn.addEventListener('click', function() {
    var itemQuantity = parseInt(document.querySelector('#quantity').value); // Récupère la quantité saisi par l'utilisateur
    var SelectedColor = ProductSelectColor.options[ProductSelectColor.selectedIndex].value; // Récupère la couleur saisi par l'utilisateur

    // Construit l'objet CartItem en fonction des données saisi par l'utilisateur
    var cartItem = {
        id : ProductId,
        color : SelectedColor,
        quantity : itemQuantity
    };
    
    // Vérifie si un panier existe déjà et récupère son contenu si oui
    if (localStorage.getItem('cart') == null) {
        var cart = []
    } else {
        var cart = JSON.parse(localStorage.getItem('cart'));
    }

    var {IsInCart, PosInCart} = IsItemAlreadyInCart(cartItem,cart); // Récupère la position du produit dans le panier et si il y est déjà présent
    if (IsInCart == true) {
        cart[PosInCart].quantity += cartItem.quantity; // Additionne la quantité déjà dans le panier avec la quantité saisi par l'utilisateur
    } else {
        cart.push(cartItem); // Ajoute le produit dans le panier
    }
    // Mets à jour le panier
    cart = JSON.stringify(cart)
    localStorage.setItem('cart',cart)
});
