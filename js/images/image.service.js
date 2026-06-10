'use strict';

const IMAGE_STORAGE_KEY = 'imageDB'
let gImgs
_createImages()

function getImgs(searchFilter) {
    if (!searchFilter) return gImgs
    
    const keywordsArr = searchFilter.trim().split(/\s+/);
    const filteredData = Object.fromEntries(
        Object.entries(gImgs).filter(([key, obj]) => {
            console.log(`key: ${key} | obj: ${obj}`)
            return filterArray.every(searchStr => obj.tags.includes(searchStr));
        })
    )
    
    return filteredData
}

function getImgById(imgId) {
    return gImgs.find(img => imgId === img.id)
}

function deleteImg(imgId) {
    const imgIdx = gPics.findIndex(img => imgId === img.id)

    gImgs.splice(imgIdx, 1)
    _saveImgsToStorage()
}

function uploadImg(url, keywords) {
    // TODO: might need to convert uploaded images to Data URI. If not here, then somewhere else
    const img = _createImg(url, keywords)
    
    gImgs.unshift(img)
    _saveImgsToStorage()
    return pic
}

// Private functions

// Create image object
function _createImg(url, keywords = ['user']) {
    return {
        id: makeId(),
        url,
        keywords
    }
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

// Save updated images object to localStorage
function _saveImgsToStorage() {
    saveToStorage(IMAGE_STORAGE_KEY, gImgs)
}