import * as $ from "jquery"

interface errorOutput {
    body:string[];
    link:any;
}
interface LinkValidator {
    isValidUrl(str:string):boolean
}
interface MessageInterface {
    body: any;
    link: string;
    heads: string;
    status: number;

}

const Validator: LinkValidator = (function () {
    const expression: RegExp = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/=]*)?/gi);
    return {
        'isValidUrl': function (url: string): boolean {
            let length:number = url.length;
            return !url.match(expression) && (length > 10);
        }
    }
})();

class SetOutputs {
    output:any;
    body:any;
    heads:any;
    status:any;
    link:any;
    $alert:any;
    [key:string]:any;
    constructor(){
        this.output = $('#output');
        this.body = $('#nav-result').children('.result');
        this.heads = $('#nav-heads').children('.heads');
        this.status = $('#nav-status').children('.status');
        this.link = $('#url');
        this.$alert = $('#alert');
    }
    Show (obj:{[key:string]:any}):void {
        Object.keys(obj).forEach((key) =>{
            key === 'link' ? this[key].val(obj[key]) : this[key].text(obj[key]);
        });
        this.output.show();
    }
    ShowOnError (obj:{body:string[],link:any}):void {
        this.$alert.empty();
        let $element = $('<div>').attr('id','error-message');
        $element.html(`<strong>${obj.body[0]}!</strong>${obj.body[1]}`).addClass(obj.body[2]);
        this.$alert.append($element);
        this.$alert.show();
    };
    HideAll ():void{
        this.$alert.hide();
        this.output.hide();
    }
}
const Output = new SetOutputs(
);

class CreateHistory {
    items: object[]= [];
    AddItem(item:MessageInterface):void {
        this.items.push(item);
        let $tr = $('<tr>')
            .html(`<td>${item.link}</td>`);

            $('#history').append($tr);
    };
    GetItem (index:number):object {
        return this.items[index];
    };
}
const MyHistory = new CreateHistory;

class Message{
    body: any;
    link: string;
    heads: string;
    status: number;

    constructor(link: string, heads: string, status:number, body:any) {
        this.link = link;
        this.heads = heads;
        this.status = status;
        if (status === 200){
            this.body = body;
        } else if (status === 404) {
            this.body = "Page Not Found"
        } else if (status === 500) {
            this.body = "Internal Error"
        } else if (status === 400) {
            this.body = "Bad Request"
        } else {
            this.body = "Something went wrong"
        }
    }
}

function httpGet (url:string) {
    return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);

            xhr.onload = () => {
                let result:MessageInterface = new Message(
                    url,
                    xhr.getAllResponseHeaders(),
                    xhr.status,
                    xhr.response
                    );

                if (xhr.status === 200) {
                    MyHistory.AddItem(result);
                }
                resolve(result);
            };

            xhr.onerror = () => {

                let onError:errorOutput ={
                    body: ["Trouble",`We can’t connect to the server ${url}`, "alert alert-danger"],
                    link: url
                };
                reject(onError);
            };

            xhr.send();

    })
}

$('#history tbody').on('click', 'tr', function () {
    let index: number = $(this).index();

    let historyItem: object = MyHistory.GetItem(index);

   Output.Show(historyItem);
});



$('.form').submit(function (event) {
    Output.HideAll();
    let url:any = $('#url').val();
    if (!Validator.isValidUrl(url)) {
        httpGet(url).then(
            (onLoad) => {
                Output.Show(onLoad);
            },
            (onError) => {
                Output.ShowOnError(onError);
            }
            );
    } else {
        let onError:errorOutput ={
            body: ["Warning"," This url is strange. Are you not deceiving our search engine?", "alert alert-warning"],
            link: url
        };
        Output.ShowOnError(onError);
    }
    event.preventDefault();
});





















