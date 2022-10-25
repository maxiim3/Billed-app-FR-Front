/**
 * @jest-environment jsdom
 */

import {findAllByTestId, fireEvent, getAllByTestId, getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js";
import {filteredBills} from "../containers/Dashboard.js";
import DashboardUI from "../views/DashboardUI.js";
import userEvent from "@testing-library/user-event";

// todo Pourquoi le fichier ne s'appelle pas bills.test.unit.js  ou bills.test.js ?
// todo Comment est sur que les mock sont integres ? Peut etre doit on utiliser les alias de typescript
// todo comment va se passer la soutenance ?

/**
 * todo :
 *      - je me connect en tant qu'employee:
 *          - l'icone dashboard est selectionnee
 *          - les datas sont presentes
 *          - lordque je click sur 'nouvelle note de frais', je suis rediriger vers new Bills /
 *              je suis sur new bills:
 *              import from newBills.test.js
 *                    - l'icone mail est selectionnee
 *                    - les champs de formulaire sont presents
 *                    - j'ajoute une image qui n'est pas du bon format, j'ai une erreur
 *                    - j'ajoute une image du bon format, je n'ai pas d'erreur
 *                    - j'envoie le formulaire
 *             - la nouvelle note est presente dans le dashboard
 *             - le nom de la note est affichee
 *             - lorsque je clique sur l'oeil, la modale s'affiche
 *             - l'image s'affiche dans la modale
 *
 */

// jest.mock("../app/store", () => mockStore)

await loadUI(ROUTES_PATH.Bills)
describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page, and the page is loaded", () => {
        test("The window icon should be highlighted", async () => {
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.className).toEqual("active-icon")
        })
    })
    describe('When I am on Bills page, there are bills, and there is one pending', () => {
        test('Then, filteredBills by pending status should return 1 bill', () => {
            const filtered_bills = filteredBills(bills, "pending")
            expect(filtered_bills.length).toBe(1)
        })
    })
    describe('When I am on Bills page, there are bills, and there is one accepted', () => {
        test('Then, filteredBills by accepted status should return 1 bill', () => {
            const filtered_bills = filteredBills(bills, "accepted")
            expect(filtered_bills.length).toBe(1)
        })
    })
    describe('When I am on Bills page, there are bills, and there is two refused', () => {
        test('Then, filteredBills by accepted status should return 2 bills', () => {
            const filtered_bills = filteredBills(bills, "refused")
            expect(filtered_bills.length).toBe(2)
        })
    })
    describe('When I am on Bills page, and I click the button .btn-new-bill', () => {
        test('Then I navigate to /#employee/bill/new ', async () => {
            await loadUI(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId("btn-new-bill"))
            const btn = screen.getByTestId("btn-new-bill")
            //         //  await connectAsEmployee()
            //         //  return document.body.innerHTML = BillsUI({data: fixtureBills})
            await userEvent.click(btn)
            expect(window.location.hash).toEqual("#employee/bill/new")
        })
    })
    describe('When I am on Bills page, and I click the button .btn-new-bill', () => {
        test('Then the mail icon is highlighted', async () => {
            await loadUI(ROUTES_PATH.NewBill)

            await waitFor(() => screen.getByTestId('icon-mail'))
            const mailIcon = screen.getByTestId('icon-mail')
            console.log(mailIcon)
            expect(mailIcon.className).toEqual("active-icon")
        })
    })
    describe('Given I am on NewBills page', () => {
        describe("When the page is loaded", () => {
            test('Then I the NewBills UI form is displayed', async () => {
                await loadUI(ROUTES_PATH.NewBill)
                const {type, name, date, price, tax1, tax2, comment, file, submitBtn} = await getFields();

                expect(type).not.toBe(false)
                expect(name).not.toBe(false)
                expect(date).not.toBe(false)
                expect(price).not.toBe(false)
                expect(tax1).not.toBe(false)
                expect(tax2).not.toBe(false)
                expect(comment).not.toBe(false)
                expect(file).not.toBe(false)
                expect(submitBtn).not.toBe(false)
            })
        })
        describe("When I add a new picture which is not [.jpg, jpeg, .png] ", () => {
            test.todo("Then I cannot add it")
        })
        describe("When I add a new picture which is [.jpg, jpeg, .png] ", () => {
            test.todo("Then I have no error")
        })
        describe("When I send the form, but all inputs are not filled", () => {
            test.todo("Then I should get a feedback message")
        })
        describe("When I send the form, and the form is correctly filled", () => {
            test.todo("Then the message should be send")
            test.todo("Then I should navigate back to the Bills page")
        })
    })
    describe("When a new bills is properly added", () => {
        test.todo("Then it should be added to the BillsUI")
        test.todo("Then the bills' name should be correct")
        test.todo("Then the bills' date should be correct")
        test.todo("Then the bills' price should be correct")
        test.todo("Then the bills' status should be 'Pending'")
        describe("when I click on the eye icon of the new bill", () => {
            test.todo("then the modal should be open")
            test.todo("then the bill's image should be displayed in the modal")
        })
    })
})
/*        test("Then four bi", async () =>
            test("Should ordered order the bills from earliest to latest", async () => {
            await loadBillsUIOnly()
            const dates = await getDates();
            const datesSorted = dates.sort((a, b) => antiChrono(a, b))
            expect(dates).toEqual(datesSorted)
        })*/

/*        test('should open the modal', async function () {
            await loadBillsPage()
            await waitFor(() => getByTestId('icon-window'))
            const windowIcon = getByTestId('icon-window')
            expect(windowIcon.classList.contains("active-icon")).toBe(true)

        });*/


export async function antiChrono(a, b) {
    const [year_a, month_a, day_a] = a.split('-')
    const [year_b, month_b, day_b] = b.split('-')
    if (year_a !== year_b) return year_b - year_a
    if (month_a !== month_b) return month_b - month_a
    return day_b - day_a
}

export async function getDates() {
    let regExp = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i;
    return screen.getAllByText(regExp).map(a => a.innerHTML);
}

export async function connectAsEmployee() {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    return window.localStorage.setItem('user', JSON.stringify({type: "Employee"}))
}

export async function loadUI(path) {
    await connectAsEmployee()
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)

    router()
    return window.onNavigate(path)
}

async function getFields() {
    await waitFor(() => {
        screen.getByTestId("expense-type")
        screen.getByTestId("expense-name")
        screen.getByTestId("datepicker")
        screen.getByTestId("amount")
        screen.getByTestId("vat")
        screen.getByTestId("pct")
        screen.getByTestId("commentary")
        screen.getByTestId("file")
        screen.getByTestId("btn-send-bill")
    })
    const type = screen.getByTestId("expense-type")
    const name = screen.getByTestId("expense-name")
    const date = screen.getByTestId("datepicker")
    const price = screen.getByTestId("amount")
    const tax1 = screen.getByTestId("vat")
    const tax2 = screen.getByTestId("pct")
    const comment = screen.getByTestId("commentary")
    const file = screen.getByTestId("file")
    const submitBtn = screen.getByTestId("btn-send-bill")
    return {type, name, date, price, tax1, tax2, comment, file, submitBtn};
}

// export async function loadBillsUIOnly(fixtureBills) {
//     await connectAsEmployee()
//     return document.body.innerHTML = BillsUI({data: fixtureBills})
//
// }

// export async function billsContainer(fixtureBills) {
//     const onNavigate = () => {
//         document.body.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, data: fixtureBills})
//     }
//     return new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
// }
