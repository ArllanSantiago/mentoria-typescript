import { textSpanEnd } from "typescript";

let apiKey:string = '3f301be7381a03ad8d352314dcc3ec1d';
let requestToken:string = '';
let username:string;
let password:string;
let sessionId:string;
let listId:string = '7101979';

let loginButton: HTMLInputElement = document.getElementById('login-button') as HTMLInputElement;
let searchButton = document.getElementById('search-button') as HTMLElement;
let searchContainer = document.getElementById('search-container') as HTMLElement;

loginButton.addEventListener('click', async () => {
    await criarRequestToken();
    await logar();
    await criarSessao();
})

searchButton.addEventListener('click', async () => {
    let lista = document.getElementById("lista");
    if (lista) {
        lista.outerHTML = "";
    }
    let query = (document.getElementById('search') as HTMLInputElement).value;
    let listaDeFilmes = await procurarFilme(query);
    let ul = document.createElement('ul');
    ul.id = "lista"   
    if (listaDeFilmes && typeof listaDeFilmes == 'object'){       
        for (const item of listaDeFilmes['results']) {
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(item.original_title))
            ul.appendChild(li)
        }
    }
    console.log(listaDeFilmes);
    searchContainer.appendChild(ul);
})

function preencherSenha(){
    password = (document.getElementById('senha') as HTMLInputElement).value;
    validateLoginButton();
}

function preencherLogin() {
    username = (document.getElementById('login')as HTMLInputElement).value;
    validateLoginButton();
}

function preencherApi() {
    apiKey = (document.getElementById('api-key')as HTMLInputElement).value;
    validateLoginButton();
}

function validateLoginButton()
{
    if (password && username && apiKey) {
        loginButton.disabled = false;
    } else {
        loginButton.disabled = true;
    }
}

class HttpClient {
    static async get({ url, method, body}) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();            
            request.open(method, url, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    resolve(JSON.parse(request.responseText));
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    })
                }
            }
            request.onerror = () => {
                reject({
                    status: request.status,
                    statusText: request.statusText
                })
            }

            if (body) {
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");                
                body = JSON.stringify(body);
            }
            request.send(body);
        })
    }
}

async function procurarFilme(p_query:string){
    const QUERY = encodeURI(p_query);
    console.log(QUERY)
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURI(QUERY)}`,
        method: "GET",
        body:null
    })
    return result
}

async function adicionarFilme(filmeId:string) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
        method: "GET",
        body:null
    })
    console.log(result);
}

async function criarRequestToken() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
        method: "GET",
        body:null
    })
    requestToken = result && typeof result == 'object' ? result['request_token'] : undefined;
}

async function logar() {
    await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
        method: "POST",
        body: {
            username: `${username}`,
            password: `${password}`,
            request_token: `${requestToken}`
        }
    })
}

async function criarSessao() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
        method: "GET",
        body:null
    })
    sessionId =  result && typeof result == 'object' ? result['session_id'] : undefined;
}

async function criarLista(nomeDaLista:string, descricao:string) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
            name: nomeDaLista,
            description: descricao,
            language: "pt-br"
        }
    })
    console.log(result);
}

async function adicionarFilmeNaLista(filmeId:string, listaId:string) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
            media_id: filmeId
        }
    })
    console.log(result);
}

async function pegarLista() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
        method: "GET",
        body:null
    })
    console.log(result);
}

