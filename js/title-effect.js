const title = "nyx ";
let index = 0;
let isDeleting = false;

function typeTitle() {
    const pageTitle = document.getElementById('pageTitle');

    if (!isDeleting) {
        pageTitle.textContent = title.substring(0, index);
        index++;

        if (index > title.length) {
            isDeleting = true;
            setTimeout(typeTitle, 2000);
            return;
        }
    } else {
        pageTitle.textContent = title.substring(0, index);
        index--;

        if (index === 0) {
            isDeleting = false;
            setTimeout(typeTitle, 500);
            return;
        }
    }

    setTimeout(typeTitle, isDeleting ? 100 : 150);
}
