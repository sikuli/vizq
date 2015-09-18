var data = require('../data/fcq.5000.json')
var VizQ = require('../lib')()
var _ = require('lodash')

VizQ.load(data.slice(0,1000))

function test(q){
    var result = VizQ.eval(q)
    console.log(JSON.stringify(result,null, ' '))
}

// test({
//     Subject: 'col',
//     CrsLvlNum: 'col'
// })
//
// test({
//     Subject: 'col',
//     Hours: 'col'
// })
//
// test({
//     CrsLvlNum: 'col',
//     Subject: 'col'
// })
//
// test({
//     Subject: 'col',
//     AVG_GRD: 'floor | col'
// })
//
// test({
//     Subject: 'col',
//     AVG_GRD: 'precision 0.5 | col'
// })
//
// test({
//     Subject: 'col',
//     AVG_GRD: 'floor | col'
// })
//
// test({
//     Subject: 'col',
//     N: {
//         ENROLL: 'precision 10 | col'
//     }
// })
//
// test({
//     Subject: 'col',
//     Workload: {
//         Raw: 'round | col'
//     }
// })


test({
    Subject: 'col'
})
