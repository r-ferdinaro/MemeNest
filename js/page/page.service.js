'use strict';

// Get images/memes from storage to img tags
// TODO: support memes
function getGalleryElements() {
    const { page, filterBy } = gQueryParams
    const contentArray = getItems(page, filterBy)
    let strHtml = ``
    
    if (contentArray) {
        contentArray.forEach( img => strHtml += `<img data-id="${img.id}" src="${img.url}" onclick="onRenderGalleryItem(this)">`)
    }
    return strHtml
}