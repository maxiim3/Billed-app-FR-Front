import {formatDate} from "../app/format.js";

export const cardBill = (bill) => {
    const firstAndLastNames = bill.email.split('@')[0]
    const firstName = firstAndLastNames.includes('.') ?
                      firstAndLastNames.split('.')[0] : ''
    const lastName = firstAndLastNames.includes('.') ?
                     firstAndLastNames.split('.')[1] : firstAndLastNames

    return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}' data-selected="false">
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}