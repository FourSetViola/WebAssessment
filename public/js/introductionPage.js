function scrollDown() {
    console.log('scrolling down');
    window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
    });
}