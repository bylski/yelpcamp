// Select elements
const campCards = document.querySelectorAll('.camp-card');
const carousels = document.querySelectorAll('.carousel')


// For Each CampCard:
campCards.forEach((campCard, i) => {
    // If mouse entered the campcard:
    campCard.addEventListener('mouseenter', () => {
        // Create carousel bootstrap object of that camp card's carousel
        const imgCarousel = new bootstrap.Carousel(carousels[i]);
        // Cycle through the carousel
        const changeInterval = setInterval(() => {
            imgCarousel.next();
            console.log("CHANGE")
        }, 3000)
        console.log('enter')

    // When mouse leaves camp card -> pause the carousel, go to the first image
    campCard.addEventListener('mouseleave', () => {
        clearInterval(changeInterval);
        imgCarousel.to(0);
        console.log('left')

    })
})
});
