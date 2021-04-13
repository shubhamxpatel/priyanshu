var express = require('express');
var router = express.Router();
var aposToLexForm = require('apos-to-lex-form');
var SpellCorrector = require('spelling-corrector');
var natural = require('natural');
const SW = require('stopword');
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

function resolve(review) {
    const lexedReview = aposToLexForm(review);
    const casedReview = lexedReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
    tokenizedReview.forEach((word, index) => {
        tokenizedReview[index] = spellCorrector.correct(word);
    })
    const filteredReview = SW.removeStopwords(tokenizedReview);
    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const analysis = analyzer.getSentiment(filteredReview);
    return analysis
}
console.log(resolve("i am normal"))
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
router.post('/s-analyzer', function(req, res, next) {
    const { review } = req.body;

    let analysis = resolve(review)

    res.status(200).json({ analysis });
});

module.exports = router;