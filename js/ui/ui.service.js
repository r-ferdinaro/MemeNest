'use strict';

// render banners for status changes - success, error, info
function showBanner(message, type = 'success') {
    const elBanner = document.querySelector('.banner')
    if (!elBanner) return

    elBanner.classList.add(`banner-${type}`)
    elBanner.innerText = message

    setTimeout(() => {
        elBanner.classList.add('banner-out')
        function onTransitionEnd() {
            elBanner.classList.remove(`banner-${type}`, 'banner-out')
            elBanner.innerText = ''
            elBanner.removeEventListener('transitionend', onTransitionEnd)
        }
        elBanner.addEventListener('transitionend', onTransitionEnd)
    }, 2500)
}
