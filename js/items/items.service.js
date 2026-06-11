'use strict';

const IMAGE_STORAGE_KEY = 'imageDB'
const MEME_STORAGE_KEY = 'memeDB'

let gMemes
let gImgs
_createImages()

// Get all/some images/memes to gallery based on search filter
function getItems(page, searchFilter = '') {
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
//     // Will require getGalleryElements to convert the dataURL to an image and insert into img element properly. 
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
                url: 'images/1.jpg',
                keywords: ['trump', 'politics', 'speaking']
            },
            {
              url: 'images/2.jpg',
              keywords: ['puppies', 'dogs', 'licking']
            },
            {
              url: 'images/3.jpg',
              keywords: ['baby', 'puppy', 'sleeping']
            },
            {
              url: 'images/4.jpg',
              keywords: ['cat', 'sleeping', 'keyboard']
            },
            {
              url: 'images/5.jpg',
              keywords: ['baby', 'beach', 'success']
            },
            {
              url: 'images/6.jpg',
              keywords: ['aliens', 'meme', 'history']
            },
            {
              url: 'images/7.jpg',
              keywords: ['baby', 'surprised', 'eyes']
            },
            {
              url: 'images/8.jpg',
              keywords: ['willy wonka', 'meme', 'smiling']
            },
            {
              url: 'images/9.jpg',
              keywords: ['baby', 'laughing', 'evil']
            },
            {
              url: 'images/10.jpg',
              keywords: ['obama', 'laughing', 'close-up']
            },
            {
              url: 'images/11.jpg',
              keywords: ['cat', 'shocked', 'meme']
            },
            {
              url: 'images/12.jpg',
              keywords: ['dog', 'smiling', 'close-up']
            },
            {
              url: 'images/13.jpg',
              keywords: ['leonardo dicaprio', 'drinking', 'meme']
            },
            {
              url: 'images/14.jpg',
              keywords: ['grumpy cat', 'frown', 'meme']
            },
            {
              url: 'images/15.jpg',
              keywords: ['minions', 'yellow', 'animation']
            },
            {
              url: 'images/16.jpg',
              keywords: ['sloth', 'smiling', 'animal']
            },
            {
              url: 'images/17.jpg',
              keywords: ['drake', 'no', 'meme']
            },
            {
              url: 'images/18.jpg',
              keywords: ['baby', 'crying', 'sad']
            },
            {
              url: 'images/19.jpg',
              keywords: ['patrick star', 'evil', 'meme']
            },
            {
              url: 'images/20.jpg',
              keywords: ['dog', 'side-eye', 'meme']
            },
            {
              url: 'images/21.jpg',
              keywords: ['drake', 'yes', 'meme']
            },
            {
              url: 'images/22.jpg',
              keywords: ['dog', 'burning house', 'fine']
            },
            {
              url: 'images/23.jpg',
              keywords: ['distracted boyfriend', 'jealousy', 'meme']
            },
            {
              url: 'images/24.jpg',
              keywords: ['spider-man', 'pointing', 'meme']
            },
            {
              url: 'images/25.jpg',
              keywords: ['cat', 'crying', 'thumbs-up']
            },
            {
              url: 'images/26.jpg',
              keywords: ['doge', 'shiba inu', 'meme']
            },
            {
              url: 'images/27.jpg',
              keywords: ['batman', 'slapping', 'robin']
            },
            {
              url: 'images/28.jpg',
              keywords: ['woman yelling', 'cat', 'table']
            },
            {
              url: 'images/29.jpg',
              keywords: ['roll safe', 'smart', 'thinking']
            },
            {
              url: 'images/30.jpg',
              keywords: ['pepe the frog', 'sad', 'meme']
            },
            {
              url: 'images/31.jpg',
              keywords: ['hide the pain', 'harold', 'smile']
            },
            {
              url: 'images/32.jpg',
              keywords: ['disaster girl', 'fire', 'smirk']
            },
            {
              url: 'images/33.jpg',
              keywords: ['kermit the frog', 'tea', 'business']
            },
            {
              url: 'images/34.jpg',
              keywords: ['futurama', 'fry', 'money']
            },
            {
              url: 'images/35.jpg',
              keywords: ['spongebob', 'mocking', 'meme']
            },
            {
              url: 'images/36.jpg',
              keywords: ['buzz lightyear', 'woody', 'everywhere']
            },
            {
              url: 'images/37.jpg',
              keywords: ['dog', 'chemistry', 'science']
            },
            {
              url: 'images/38.jpg',
              keywords: ['cat', 'smudge', 'salad']
            },
            {
              url: 'images/39.jpg',
              keywords: ['kid', 'tall', 'giraffe']
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