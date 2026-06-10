'use strict';

function getGalleryContent() {
    const { page, filterBy } = gQueryParams
    const imgArray = (page === 'gallery') ? getImgs(filterBy) : getMemes(filterBy)
    let strHtml = ``

    imgArray.forEach( img => strHtml += `<img data-idx="${img.id}" src="${img.url}">`);
    return strHtml
}