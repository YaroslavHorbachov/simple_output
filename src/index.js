"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
(function () {
    //Validation object
    const Validate = (function () {
        const expression = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
        return {
            'link': function (url) {
                return !url.match(expression);
            }
        };
    })();
    //History object
    const MyHistory = (function () {
        const Items = [];
        return {
            'add': function (item) {
                Items.push(item);
            },
            'getItem': function (index) {
                return Items[index];
            }
        };
    })();
    //History records(side panel)
    const MyHistoryRecords = (function () {
        const $table = $('#history');
        return {
            'add': function (data) {
                let $tr = $('<tr>')
                    .html(`<td>${data}</td>`);
                $table.append($tr);
            },
            'getUrl': function (index) {
                const elem = $table.find('tr')[index];
                return $(elem.children[0]).text().toString();
            }
        };
    })();
    //Main output field
    const MessageField = (function () {
        const $field = $('#output');
        return {
            'show': function (item) {
                if (Array.isArray(item)) {
                    let $col = $('<div>')
                        .addClass('col-12');
                    $('<div>')
                        .html(`<strong>${item[0]}!</strong>&nbsp;${item[2]}`)
                        .addClass(item[1]).appendTo($col);
                    $field.append($col);
                }
                else {
                    let data = JSON.parse(item);
                    const $table = $('<table>')
                        .addClass('table table-striped table-bordered table-hover')
                        .attr('id', 'output-table');
                    let keys = Object.keys(data[0]);
                    $table.html(function () {
                        let tr = `<tr>${keys.map(function (t) { return `<th>${t}</th>`; }).join('')}</tr>`;
                        let body = data.map(x => {
                            return `<tr>${Object.values(x).map(x => `<td>${x}</td>`).join('')}</tr>`;
                        }).join('');
                        return `<thead>${tr}</thead><tfoot>${tr}</tfoot><tbody>${body}</tbody>`;
                    });
                    $field.append($table);
                    $table.DataTable({
                        scrollY: '67vh',
                        scrollCollapse: true
                    });
                }
            },
            'clear': function () {
                $field.empty();
            },
            'onError': function (data) {
                let $col = $('<div>')
                    .addClass('col-12');
                $('<div>').html(`<strong>${data[0]}!</strong>&nbsp;${data[2]}`).addClass(data[1]).appendTo($col);
                $field.append($col);
            }
        };
    })();
    //HTTP Request func
    function httpGet(url) {
        return new Promise(function (resolve, reject) {
            if (url === "undefined" || url.length < 10) {
                reject(["Error",
                    "alert alert-danger alert-dismissable", "Invalid input"]);
            }
            else if (Validate.link(url)) {
                reject(["Warning",
                    "alert alert-warning alert-dismissable", " This url is strange. Are you not deceiving our search engine?"]);
            }
            else {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = function () {
                    if (xhr.status === 404) {
                        reject(["Sorry",
                            "alert alert-info", " Not Found "]);
                    }
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    }
                };
                xhr.onerror = function () {
                    reject(["Trouble",
                        "alert alert-danger alert-dismissable", `We can’t connect to the server ${url}`]);
                };
                xhr.send();
            }
        });
    }
    /*EVENT HANDLERS*/
    //Parameters checkbox
    $('#toggle-parameters').on('change', function () {
        $('#parameters').prop('disabled', !$('#toggle-parameters').prop('checked')).val('');
    });
    //History side panel
    $('#history tbody').on('click', 'tr', function () {
        let index = $(this).index();
        let historyUrl = MyHistoryRecords.getUrl(index);
        let historyItem = MyHistory.getItem(index);
        if (historyUrl.indexOf('?') < 0) {
            $('#parameters')
                .prop('disabled', true)
                .val('');
            $('#toggle-parameters')
                .prop('checked', 'false');
            $('#url')
                .val(historyUrl);
        }
        else {
            historyUrl = historyUrl.split('?');
            $('#url')
                .val(historyUrl[0]);
            $('#parameters')
                .prop('disabled', false)
                .val(historyUrl[1]);
            $('#toggle-parameters')
                .prop('checked', 'true');
        }
        MessageField.clear();
        MessageField.show(historyItem);
    });
    //Submit button
    $('.form').submit(function (event) {
        let url = $('#url').val();
        if ($('#toggle-parameters').prop('checked')) {
            url += '?' + $('#parameters').val();
        }
        ;
        MyHistoryRecords.add(url);
        httpGet(url).then(function (data) {
            MessageField.clear();
            try {
                MessageField.show(data);
                MyHistory.add(data);
            }
            catch (error) {
                let syntaxError = ["Syntax Error", "alert alert-info alert-dismissable",
                    "Along this path, the JSON document was not found"];
                MessageField.clear();
                MessageField.show(syntaxError);
                MyHistory.add(syntaxError);
            }
        }, function (data) {
            MessageField.clear();
            MessageField.show(data);
            MyHistory.add(data);
        });
        event.preventDefault();
    });
})();
