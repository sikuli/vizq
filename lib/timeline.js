import Promise from 'bluebird'
import _ from 'lodash'
import moment from 'moment'
let fs = Promise.promisifyAll(require('fs'))


let EventEmitter = require("events").EventEmitter


function year(item){
    return moment(new Date(item.date)).year()
}

function computeHistogram(items, filterFunc){

    let matches = _.filter(items, filterFunc)

    let gs = _.groupBy(matches, year)

    let hist = _.mapValues(gs, (v,k) => {
        return v.length
    })
    return hist
}

function computeHistogram1(items, filterFunc){

    // let matches = _.filter(items, filterFunc)
    let matches = _.flatten(_.pluck(items, 'file_callsites'))

    let gs = _.groupBy(matches)

    let hist = _.mapValues(gs, (v,k) => {
        return v.length
    })

    hist = _.pick(hist, v => {
        return v > 200
    })
    return hist
}

class IncremenalHistogram {
    constructor() {
        this.hist = {}
        this.total = 0
    }

    add(items, filterFunc) {
        let hist = computeHistogram(items, filterFunc)
        this.total += items.length
        _.forIn(hist, (v,k) => {
            this.hist[k] = _.get(this.hist, k, 0) + v
        })
        console.log(this.total, this.hist)
    }
}

import glob from 'glob'
let files = glob.sync('/Users/tomyeh/data/slices/*')
// _.map(['a','b','c','d','e','f'], c => {
//     return `/Users/tomyeh/data/slices/xa${c}`
// })

export default class Timeline {

    constructor(options){
        this.ee = new EventEmitter()

        //this.filterFunc = item => {return _.includes(item[options.field], options.pattern)}
        this.filterFunc = item => {return _.some(item[options.field], v => {
            if (v.match(options.pattern)){
                return true
            }
        })}
    }

    onData(callback){
        this.ee.on('data', items => {
            if (!this.stopped){
                this.H.add(items, this.filterFunc)
                callback(this.H)
            }
        })
    }

    stop(){
        this.stopped = true
    }

    start(){

        this.H = new IncremenalHistogram()

        Promise.each(files, (file,i) => {

            if (!this.stopped){

                return fs.readFileAsync(file, 'utf8')
                    .then((contents) => {
                        // console.log('file',i)
                        let items = _.map(contents.trim().split('\n'), JSON.parse)
                        // console.log('items ', items.length)
                        this.ee.emit('data', items)
                    })

            }
        })
    }
}
