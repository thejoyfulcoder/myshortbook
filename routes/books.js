const express = require('express')
const router = express.Router()
// Getting Book Schema
const Author = require('../models/author')
const Book = require('../models/book')
// const multer = require('multer')
const { query } = require('express')



// diskstorage is used to specify how the files will be stored.
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname);
//     }
// })

//   const fileFilter = function (req, file, cb) {
//     //reject a file
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }}
// const upload = multer({
//     storage: storage, limits: {
//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter: fileFilter
// });




// All Books Routes
router.get('/', async (req, res) => {
    let query = Book.find() 
    if(req.query.title != null && req.query.title != ''){     
        // regex() Selects documents where values match a specified regular expression.
         query= query.regex('title', new RegExp(req.query.title,'i'))
    }
    if(req.query.readBefore != null && req.query.readBefore != ''){
        //Matches values that are less than or equal to a specified value.
         query= query.lte('read_date', new RegExp(req.query.readBefore))
    }
    if(req.query.readAfter != null && req.query.readAfter != ''){
        // Matches values that are greater than or equal to a specified value.
         query= query.gte('read_date', new RegExp(req.query.readAfter))
    }
    try{
        const books = await query.exec()
 res.render('books/index',{
        books:books,
        typedText: req.query
    })
    }catch{
        res.redirect('/')
    }
   

})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/',  async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        read_date: new Date(req.body.read_date),
        // Here we are using the Date() constructor function because the req.body.publishDate wil return a string which we want to be converted into date format.
        pageCount: req.body.pageCount,
        mybooknotes: req.body.mybooknotes
    })
      saveCover(book, req.body.cover);
    try {
        const newBook = await book.save()                                                  
        res.redirect(`books`)
    } catch {
        renderNewPage(res, new Book(), true)
    }
})

 

async function renderNewPage(res, book, hasError = false) {
    try { 
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) { params.errorMessage = 'Error Creating Book' }
        res.render('books/new', params)
    }
    catch {
        res.redirect('/books')
    }
}
const imageMimeTypes = ['image/jpeg', 'image/png']
function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded) //Here we are converting the string which is internally a json into a json object
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router;

