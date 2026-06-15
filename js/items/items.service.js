'use strict';

const IMAGE_STORAGE_KEY = 'imageDB'
const MEME_STORAGE_KEY = 'memeDB'

let gMemes
let gImgs
_createImages()
_createMemes()

// hardcoded emoji list
const gStickers = [
    { id: 'st1', emoji: '😀' },
    { id: 'st2', emoji: '😎' },
    { id: 'st3', emoji: '😂' },
    { id: 'st4', emoji: '😍' },
    { id: 'st5', emoji: '🔥' },
    { id: 'st6', emoji: '👍' },
    { id: 'st7', emoji: '🎉' },
    { id: 'st8', emoji: '💯' },
    { id: 'st9', emoji: '🚀' },
    { id: 'st10', emoji: '🐶' },
    { id: 'st11', emoji: '🐱' },
    { id: 'st12', emoji: '💀' }
]

function getStickers() {
    return gStickers
}

function getStickerById(stickerId) {
    return gStickers.find(sticker => sticker.id === stickerId)
}

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

// Build a { keyword: score } map for the page's data source,
// where score is the amount of images/memes that hold the keyword
function getKeywords(page) {
    const dataSource = (page === 'gallery') ? gImgs : gMemes
    const keywordMap = {}

    dataSource.forEach(item => {
        if (!item.keywords) return
        item.keywords.forEach(keyword => {
            keywordMap[keyword] = (keywordMap[keyword] || 0) + 1
        })
    })
    return keywordMap
}

// get image/meme from storage
function getItemById(type, id) {
    const dataSource = (type === 'image') ? gImgs : gMemes
    return dataSource.find(item => id === item.id)
}

// save new meme or update existing one
// save the current meme from the editor.
function saveMeme(imgUrl) {
    return (gMeme.id) ? _updateMeme(imgUrl) : _saveNewMeme(imgUrl)
}

function saveEditorState() {
    const { itemId, itemType } = gSelectedItem

    const editorData = {
        meme: gMeme,
        selectedItem: { 
            itemId,
            itemType
        }
    }

    saveToStorage('editorDB', editorData)
}

function restoreEditorState() {
    const saved = loadFromStorage('editorDB')
  
    if (!saved || !saved.meme) return false
  
    gMeme = saved.meme
    gSelectedItem = {
        ...saved.selectedItem,
        elImg: null
      }
  
    return true
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

// save new meme to localStorage
function _saveNewMeme(imgUrl) {
    const meme = _createMeme(imgUrl)

    gMemes.unshift(meme)
    _saveMemesToStorage()
    return meme
}

// Update an existing saved meme in place and return it
function _updateMeme(imgUrl) {
    const meme = _createMeme(imgUrl)
    const memeIdx = gMemes.findIndex(meme => meme.id === gMeme.id)

    // fall back to saving as new if the original was removed in the meantime
    if (memeIdx === -1) gMemes.unshift(meme)
    else gMemes.splice(memeIdx, 1, meme)

    _saveMemesToStorage()
    return meme
}

// Build a storable meme record from the current gMeme state
function _createMeme(imgUrl) {
    const { id: memeId, selectedImgId, drawings: memeDrawings } = gMeme

    // reuse the existing meme id when editing, otherwise mint a new one
    const id = memeId || makeId()
    const baseImg = getItemById('image', selectedImgId)
    const keywords = (baseImg) ? baseImg.keywords : []
    const drawings = JSON.parse(JSON.stringify(memeDrawings))

    return {
        id,
        url: imgUrl,
        selectedImgId,
        selectedDrawingIdx: null,
        keywords,
        drawings
    }
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
              keywords: ['aliens', 'history']
            },
            {
              url: 'images/7.jpg',
              keywords: ['baby', 'surprised', 'eyes']
            },
            {
              url: 'images/8.jpg',
              keywords: ['willy wonka', 'smiling']
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
              keywords: ['basketball', 'players', 'fight']
            },
            {
              url: 'images/12.jpg',
              keywords: ['man', 'pointing', 'fingers']
            },
            {
              url: 'images/13.jpg',
              keywords: ['leonardo dicaprio', 'drinking']
            },
            {
              url: 'images/14.jpg',
              keywords: ['morpheus', 'matrix']
            },
            {
              url: 'images/15.jpg',
              keywords: ['boromir', 'lord of the rings']
            },
            {
              url: 'images/16.jpg',
              keywords: ['picard', 'star trek', 'laughing']
            },
            {
              url: 'images/17.jpg',
              keywords: ['putin', 'politics', 'speaking']
            },
            {
              url: 'images/18.jpg',
              keywords: ['toy story', 'buzz lightyear', 'everywhere']
            },
            {
              url: 'images/19.jpg',
              keywords: ['guy', 'shocked']
            },
            {
              url: 'images/20.jpg',
              keywords: ['trump', 'politics', 'pointing']
            },
            {
              url: 'images/21.jpg',
              keywords: ['aliens', 'history']
            },
            {
              url: 'images/22.jpg',
              keywords: ['dr evil', 'air quotes']
            },
            {
              url: 'images/23.jpg',
              keywords: ['kids', 'dancing', 'happy']
            },
            {
              url: 'images/24.jpg',
              keywords: ['trump', 'politics', 'pointing']
            },
            {
              url: 'images/25.jpg',
              keywords: ['baby', 'surprised', 'eyes']
            },
            {
              url: 'images/26.jpg',
              keywords: ['puppy', 'dog', 'cute']
            },
            {
              url: 'images/27.jpg',
              keywords: ['obama', 'laughing', 'close-up']
            },
            {
              url: 'images/28.jpg',
              keywords: ['basketball', 'players', 'fight']
            },
            {
              url: 'images/29.jpg',
              keywords: ['leonardo dicaprio', 'drinking']
            },
            {
              url: 'images/30.jpg',
              keywords: ['morpheus', 'matrix']
            },
            {
              url: 'images/31.jpg',
              keywords: ['boromir', 'lord of the rings']
            },
            {
              url: 'images/32.jpg',
              keywords: ['oprah', 'excited']
            },
            {
              url: 'images/33.jpg',
              keywords: ['picard', 'star trek', 'laughing']
            },
            {
              url: 'images/34.jpg',
              keywords: ['putin', 'politics', 'speaking']
            },
            {
              url: 'images/35.jpg',
              keywords: ['toy story', 'buzz lightyear', 'everywhere']
            },
            {
              url: 'images/36.jpg',
              keywords: ['puppies', 'dogs', 'licking']
            },
            {
              url: 'images/37.jpg',
              keywords: ['baby', 'puppy', 'sleeping']
            },
            {
              url: 'images/38.jpg',
              keywords: ['cat', 'sleeping', 'keyboard']
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

// load memes from localStorage
function _createMemes() {
    gMemes = loadFromStorage(MEME_STORAGE_KEY) || []
}

// Save updated images to localStorage
function _saveImgsToStorage() {
    saveToStorage(IMAGE_STORAGE_KEY, gImgs)
}

// Save created images to localStorage
function _saveMemesToStorage() {
    saveToStorage(MEME_STORAGE_KEY, gMemes)
}