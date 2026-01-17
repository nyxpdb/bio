document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 123) {
        event.preventDefault();
        return false;
    }

    if (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74 || event.keyCode === 67)) {
        event.preventDefault();
        return false;
    }

    if (event.ctrlKey && event.keyCode === 85) {
        event.preventDefault();
        return false;
    }

    if (event.ctrlKey && event.keyCode === 83) {
        event.preventDefault();
        return false;
    }
});

document.addEventListener('selectstart', event => event.preventDefault());

console.log('[Protection] Browser protections enabled');
