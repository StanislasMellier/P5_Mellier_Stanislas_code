var itemContainer = document.querySelector('#items'); // Sélectionne la section où les produits seront afficher
// Effectue une requête de type GET afin d'obtenir les détails des produits
fetch('http://localhost:3000/api/products')
    .then(function(res) {
        return res.json();
    })
    .then(function(value) {
        // Pour chaque produit on créer un élément et on y insère les détails
        for( let i in value) {
            let e = document.createElement('a');
            e.setAttribute('href', `./product.html?id=${value[i]._id}`);
            e.innerHTML = 
            `<article>
            <img src="${value[i].imageUrl}" alt="${value[i].altTxt}">
            <h3 class="productName">${value[i].name}</h3>
            <p class="productDescription">${value[i].description}</p>
            </article>`;
            itemContainer.append(e);
        }
    })
    .catch(function(err) {
        console.error(err)
    });