class Client{
    constructor(){
        //Estou utilizando o '_' antes das variáveis como uma forma de definir como private, já que o JS não possui modificadores de acesso
        this._name
        this._cpf
        this._email
        this._phone
    }

    getName(name){
        return this._name
    }

    setName(name){
        this._name = name
    }

    getCpf(){
        return this._cpf
    }

    setCpf(cpf){
        this._cpf = cpf
    }

    getPhone(){
        return this._phone
    }

    setPhone(phone){
        this._phone = phone
    }

    getEmail(){
        return this._email
    }

    setEmail(email){
        this._email = email
    }

    save(getLocalStorage, setLocalStorage, updateInView){
        let localStorageTemp = [] // Variável será usada para receber o que irá para o localStorage
        let clientsUpdate // irá receber o localStorage após JSON.stringfy
        let clients //Irá receber os clientes já cadastrados
        
        let client = {
            name: this.getName(),
            cpf: this.getCpf(),
            phone: this.getPhone(),
            email: this.getEmail()
        }

        //Caso ainda não exista um storage clients, crie e coloque o cliente.
        if(!getLocalStorage('clients')){
            setLocalStorage('clients',JSON.stringify(client))
            updateInView(client)
            return true
        }

        //Só chegará aqui se já existir 1 cliente


        //Obtém a string e converte em JSON
        clients = JSON.parse(getLocalStorage('clients'))
        if(Array.isArray(clients)){
            //Se for array
            //Fiz desta forma pois a partir do terceiro cliente ele retornava um array e ao realizar push, a variável se tornava uma matriz, e utilizando o operador spread ele adiciona cada item do array neste novo array
            localStorageTemp.push(...clients, client)
        }else{
            //Caso não seja array e sim apenas um objeto
            localStorageTemp.push(clients, client)
        }

        clientsUpdate = JSON.stringify(localStorageTemp)
        setLocalStorage('clients',clientsUpdate)
        
        //Caso não exista a tabela, ele sai da função. Util para página de Cadastro
        if(!document.querySelector('.table-body'))
            return true

        updateInView(client)
        return true
         
    }
}

//Constantes
const client = new Client()
const clients = []
const domparser = new DOMParser()

//--------------------

//As funções get/set LocalStorage eu criei desta forma para passa-lás como parâmetro no método save que está dentro da classe Client
const getLocalStorage = (field) => {
    return localStorage.getItem(field)
}

const setLocalStorage = (field, value) => {
    try {
        localStorage.setItem(field, value)
        return true
    } catch (error) {
        return error
    }
}

//Está variável está sendo passada como parâmetro no método save do objeto client para atualizar a View sempre que um cliente é adicionado
const updateInView = (value) => {
    //Crianndo uma template string com um template html para converter a documento, manipular e selecionar apenas a tr que possui classe client
    let templateDOM = `'<html>
        <body>
            <table>
                <tr id="${value.cpf}" class="client">
                    <td>${value.name}</td>
                    <td>${value.cpf}</td>
                    <td>${value.phone}</td>
                    <td>${value.email}</td>
                    <td><button class='btn btn-delete' onClick="deleteClient(${value.cpf})">Excluir</button></td>
                </tr>
            </table>
        </body>
    </html>'`

    //Convertendo o template string
    let fromHtml = domparser.parseFromString(templateDOM, 'text/html')
    fromHtml = fromHtml.querySelector('.client')

    //Selecionando a tabela do front end através da classe abaixo.
    let table = document.querySelector('.table-body')
    //AppendChield coloca o documento após o último filho do document que está selecionado
    table.appendChild(fromHtml)

}
/*Funções

Função irá criar um cliente novo e adicionar sempre em localStorage*/
function createNewClient(value){
    client.setName(value.name)
    client.setPhone(value.phone)
    client.setCpf(value.cpf)
    client.setEmail(value.email)
    
    //Método responsável por salvar o cliente em localStorage
    return client.save(getLocalStorage, setLocalStorage, updateInView)
}

function deleteClient(cpf){
    //Obtem todos os clientes
    let clientList = JSON.parse(getLocalStorage('clients'))
    let newClientList = []
    //Percorre cada cliente no array
    clientList.map(client => {
        //Caso o cliente selecionado não tenha o cpf igual ao que foi passada por parametro, ele adiciona no novo array, e assim no próximo save o cliente não estará mais lá
        if(client.cpf != cpf)
            newClientList.push(client)
    })
    clientList = JSON.stringify(newClientList)
    setLocalStorage('clients',clientList)
    window.location.reload()
}

//Função para o carregamento da página
function onLoad(){
    if(getLocalStorage('clients')){
        let clients = JSON.parse(getLocalStorage('clients'))
        clients.map(client => {
            updateInView(client)
        })
    }
}

//Evento ao envior submit de Novo Cliente
function handleSubmit(){
    //Selecionando o input
    let name = document.querySelector('#name')
    let phone = document.querySelector('#phone')
    let email = document.querySelector('#email')
    let cpf = document.querySelector('#cpf')

    let newClient = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        cpf: cpf.value
    }

    createNewClient(newClient)
    //Manda o usuário para a página inicial sem salvar no histório
    window.location.assign('./')
}


//Função de primeiro carregamento, para popular o localStorage com os clientes da API
async function httpGet(){
    var http = new XMLHttpRequest()
    http.onreadystatechange = async function() {
        //readyState possui 4 estados, sendo apenas o último que contém retorno
        if (this.readyState == 4 && this.status == 200) {
            var arr = await JSON.parse(this.responseText)
            arr.map(value => {
                createNewClient(value)
            })
        }
    };
    http.open('GET','https://private-21e8de-rafaellucio.apiary-mock.com/users', true)
    http.send()
}

//Inicio da Aplicação, caso não exista ainda o onInit definido como true, ele irá fazer a requisição e popular os clientes
if(!getLocalStorage('clients')){
    setLocalStorage('onInit',true)
    httpGet()
}