import {ROUTES_PATH} from '../constants/routes.js'
import Logout from "./Logout.js"
import {FILE_EXTENSION} from "../constants/fileExtension.js";

export default class NewBill {
    constructor({document, onNavigate, store, localStorage}) {
        this.document = document
        this.onNavigate = onNavigate
        this.store = store
        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener("submit", this.handleSubmit)
        const file = this.document.querySelector(`input[data-testid="file"]`)
        file.addEventListener("change", this.handleChangeFile)
        this.fileUrl = null
        this.fileName = null
        this.billId = null
        new Logout({document, localStorage, onNavigate})
    }

    isValidExtension(extension) {
        if (typeof extension !== 'string')
            throw new Error('extension is not type of string')
        else if (!FILE_EXTENSION.IMAGE.some(ext => ext === extension))
            throw new Error("image extension must be .jpg, .jpeg or .png")
        return true
    }

    handleChangeFile = e => {
        e.preventDefault()
        const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
        const filePath = e.target.value.split(/\\/g)
        const fileName = filePath[filePath.length - 1]
        const formData = new FormData()
        const email = JSON.parse(localStorage.getItem("user")).email
        const imgExtension = fileName.split('.').at(-1)
        formData.append('file', file)

        formData.append('email', email)

        try {
            this.isValidExtension(imgExtension)
            this.store
                .bills()
                .create({
                            data: formData, headers: {
                        noContentType: true
                    }
                        })
                .then((formData) => {
                    this.billId = formData.key
                    this.fileUrl = formData.filePath
                    this.fileName = fileName
                }).catch(error => {
                throw new Error(error)
            })
        }
        catch (e) {
            console.error(e)
        }
    }


    handleSubmit = e => {
        e.preventDefault()
        console.log(e.target.querySelector(`input[data-testid="file"]`).value)
        const email = JSON.parse(localStorage.getItem("user")).email
        const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
            name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
            amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
            date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
            commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: 'pending'
        }
        console.log(bill) // todo comment est ajouté l'image  au server ?
        this.updateBill(bill)
        this.onNavigate(ROUTES_PATH['Bills'])
    }

    // not need to cover this function by tests
    updateBill = (bill) => {
        if (this.store) {
            this.store
                .bills()
                .update({data: JSON.stringify(bill), selector: this.billId})
                .then(() => {
                    this.onNavigate(ROUTES_PATH['Bills'])
                })
                .catch(error => console.error(error))
        }
    }
}