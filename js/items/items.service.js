'use strict';

const IMAGE_STORAGE_KEY = 'imageDB'
const MEME_STORAGE_KEY = 'memeDB'

let gMemes
let gImgs
_createImages()

// Get all/some images/memes to gallery based on search filter
function getItems(page, searchFilter) {
    const dataSource = (page === 'gallery') ? gImgs : gMemes
    if (!searchFilter || !searchFilter.trim()) return dataSource
    
    const keywordsArr = searchFilter.trim().toLowerCase().split(/\s+/);
    
    return dataSource.filter(obj => {
        if (!obj.keywords) return false
        return keywordsArr.every(searchStr => {
            return obj.keywords.some(keyword =>
                keyword.toLowerCase().includes(searchStr)
            )
        })
    })
}

// TODO: use this to get desired image/meme from storage
function getItemById(type, id) {
    const dataSource = (type === 'image') ? gImgs : gMemes
    return dataSource.find(item => id === item.id)
}

// TODO: implement deleting a photo/meme
// function deleteItem(type, id) {
//     const dataSource = (type === 'image') ? gImgs : gMemes
//     const itemIdx = dataSource.findIndex(item => itemId === item.id)

//     dataSource.splice(itemIdx, 1)
//     _saveImgsToStorage()
// }

// TODO: save meme from editor page
function saveMeme() {
    (gMeme.id) ? _updateMeme() : _saveMeme()
}

// // TODO: support uploads in a future PR.
// function uploadImg(url, keywords) {
//     // TODO: add a property to gImgs to differ between local/uploaded images. 
//     // If local image - grab from files | if uploaded image - save to localStorage as dataURL.
//     // Will require getGalleryContent to convert the dataURL to an image and insert into img element properly. 
//     const img = _createImg(url, keywords)
    
//     gImgs.unshift(img)
//     _saveImgsToStorage()
//     return pic
// }

// Private functions

// Create image object
function _createImg(url, keywords = ['user']) {
    return {
        id: makeId(),
        url,
        keywords
    }
}

// Save new meme to Storage
function _saveNewMeme() {
    const meme = {
        id: makeId(),
        ...gMeme
    }
    
    gMemes.unshift(meme)
    _saveImgsToStorage()
}

// Save an existing meme
function _updateMeme() {
    const memeIdx = gMemes.findIndex(meme => meme.id === gMeme.id)
    
    gMemes.splice(memeIdx, 1, gMeme)
}

// Load images from localStorage or load sample ones
function _createImages() {
    let images = loadFromStorage(IMAGE_STORAGE_KEY)

    if (!images || !images.length) {
        const sampleImages = [
            {
                url: "images/1.jpg",
                keywords:['trump', 'funny']
            },
            {
                url: "images/2.jpg",
                keywords:['puppy', 'cute']
            }
        ]
        images = []
        
        sampleImages.forEach(img => images.push(_createImg(img.url, img.keywords)))
    }

    gImgs = images
    _saveImgsToStorage()
}

// Save updated images to localStorage
function _saveImgsToStorage() {
    saveToStorage(IMAGE_STORAGE_KEY, gImgs)
}

// Save created images to localStorage
function _saveMemesToStorage() {
    saveToStorage(MEME_STORAGE_KEY, gMemes)
}