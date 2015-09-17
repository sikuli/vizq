var _ = require('lodash')

//require('lodash-math')(_)
module.exports = function() {

    var data, current

    function load(input) {
        data = input
        current = data
        return current
    }

    function total() {
        return data.length
    }

    function select(column_names) {
        current = _.map(current, _.partialRight(_.pick, column_names))
        return current
    }

    function top(column_name) {
        current = _(current)
            .groupBy(column_name)
            .map(function(value, key) {
                var o = {}
                o[column_name] = key
                o.count = value.length
                return o
            })
            .sortBy('count')
            .reverse()
            .value()
        return current
    }

    function _performGroupBy(rows, column_name) {

        var num_columns = _.keys(rows[0]).length

        return _(rows)
            .groupBy(column_name)
            .map(function(value, key) {
                var o = {}
                o[column_name] = key,
                o.count = value.length

                if (num_columns > 1) {
                    o.children = _.map(value, _.partialRight(_.omit, column_name))
                }
                return o
            })
            .value()
    }

    function _groupByRecursively(rows, column_name) {

        if (rows[0].children) {

            if (column_name in rows[0]) {

                // already grouped by this column_name
                // do nothing and return as is
                return rows

            } else {

                _(rows)
                    .forEach(function(g) {
                        var children = _groupByRecursively(g.children, column_name)
                        if (children.length > 0)
                            g.children = children
                    }).value()

                return rows
            }

        } else {

            return _performGroupBy(rows, column_name)

        }
    }

    function sum(column_name) {
        current = _sumR(current, column_name)
        return current
    }

    function _sumR(rows, column_name) {
        if (column_name in rows[0]) {

            console.log(rows)
            return _.sum(_.map(_.pluck(rows, column_name), Number))

        } else if ('children' in rows[0]) {

            _(rows)
                .forEach(function(row) {

                    var name = 'sum-' + column_name + ''
                    name = _.kebabCase(name)
                    row[name] = _sumR(row.children, column_name)

                })
                .value()

            return rows
        }
    }

    function groupBy(column_name) {
        current = _groupByRecursively(current, column_name)
        return current
    }

    function filterBy(column_name, value) {
        var o = {}
        o[column_name] = value
        current = _.filter(current, o)
        return current
    }

    function dump(){
        console.log(current)
    }

    function show() {
        if (_.isArray(current)) {
            var top = current.slice(0, 5)
            return jade.renderFile(__dirname + '/table.jade', {
                data: top,
                '_': _,
                total: current.length
            })
        }
        else{
            return '<table><tr><td>' + current + '</tr></td></table>'
        }
    }

    function countBlank() {
        current = _.filter(current, _.isEmpty).length
        return current
    }

    function reset() {
        current = data
        return current
    }

    function unique() {
        // TODO: must be a column
        current = _.unique(current)
        return current
    }

    function sort(column_name) {
        current = _(current)
            .sortBy(column_name)
            .value()
        return current
    }

    function get(){
        return current
    }

    return {
        total: total,
        select: select,
        show: show,
        countBlank: countBlank,
        reset: reset,
        unique: unique,
        sort: sort,
        groupBy: groupBy,
        filterBy: filterBy,
        load: load,
        sum: sum,
        top: top,
        dump: dump,
        get: get
    }
}
