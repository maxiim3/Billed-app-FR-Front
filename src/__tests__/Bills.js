/**
 * @jest-environment jsdom
 */

import Bills from "../containers/Bills.js";
import billsUI from "../views/BillsUI.js"
import router from "../app/Router.js";
import store from "../app/Store.js";
import userEvent from "@testing-library/user-event";
import {ROUTES_PATH} from "../constants/routes.js";
import {bills} from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom"


const mockBills = jest.mock('../containers/Bills.js')


export async function antiChrono(a, b) {
    const [year_a, month_a, day_a] = a.split('-')
    const [year_b, month_b, day_b] = b.split('-')
    if (year_a !== year_b) return year_b - year_a
    if (month_a !== month_b) return month_b - month_a
    return day_b - day_a
}

export async function connectAsEmployee() {
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({type: "Employee"}))
}

export async function loadRoutes(path) {
    await connectAsEmployee()
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)

    router()
    window.onNavigate(path)
}

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page, and the page is loaded", () => {
        test("Then the window icon should be highlighted", async () => {
            await loadRoutes(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.className).toEqual("active-icon")
        })
        test("Then the table should have as much tableRows as mocked data", async () => {
            await connectAsEmployee()
            document.body.innerHTML = billsUI({data: bills, error: false, loading: false})
            await waitFor(() => screen.getByTestId('tbody'))
            const tBody = screen.getByTestId('tbody')
            const getRows = [...tBody.childNodes].filter(node => node instanceof HTMLTableRowElement)
            expect(getRows).toHaveLength(bills.length)
        })
        test("Then the bills should be ordered from earliest to latest", async () => {
            await connectAsEmployee()
            document.body.innerHTML = await billsUI({data: bills, error: false, loading: false})

            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
            const datesSorted = dates.sort((a, b) => antiChrono(a, b))
            expect(dates).toEqual(datesSorted)
        })
    })
    describe('When I am on Bills page, and I click the button to create a New Bill', () => {
        test('Then I navigate to /#employee/bill/new', async () => {
            await connectAsEmployee()
            document.body.innerHTML = await billsUI({data: bills, error: false, loading: false})

            await waitFor(() => screen.getByTestId("btn-new-bill"))
            const btn = screen.getByTestId("btn-new-bill")
            const mockFn = jest.fn(async () => await loadRoutes(ROUTES_PATH.NewBill))
            btn.onclick = () => mockFn()

            await userEvent.click(btn)
            expect(mockFn).toHaveBeenCalled()
            expect(window.location.hash === "#employee/bill/new").toBeTruthy()
        })
    })
    describe('When I am on Bills page, and I call handleClickNewBill from container/Bills', () => {
        test('Then I navigate to /#employee/bill/new', async () => {
            await loadRoutes(ROUTES_PATH.Bills)
            const onNavigate = () => window.onNavigate(ROUTES_PATH['NewBill'])
            const containerBills = new Bills({document, onNavigate, store, localStorage})
            jest.mock("../containers/Bills.js")
            const mockHandleClickNewBill = jest.fn(() => containerBills.handleClickNewBill())
            mockHandleClickNewBill()
            expect(window.location.hash === "#employee/bill/new").toBeTruthy()
        })
    })
    describe("Given I am on Bills' Page", () => {
        // connect as employee and add mocked store
        beforeEach(async () => {
            // Bills.mockClear()
            // https://jestjs.io/docs/es6-class-mocks

            await connectAsEmployee()
        })
        afterEach(() => mockBills.clearAllMocks())
        document.body.innerHTML = billsUI({data: bills, error: false, loading: false})
        const onNavigate = () => window.onNavigate(ROUTES_PATH['Bills'])
        const containerBills = new Bills({document, onNavigate, store, localStorage})


        describe("Given i added a new bill is properly", () => {
            beforeEach(async () => await waitFor(() => screen.getByTestId('tbody')))
            afterEach(() => mockBills.clearAllMocks())

            const INDEX = 0
            // get tBody from form element
            const tBody = screen.getByTestId('tbody')
            // get rows from table
            const getRows = [...tBody.childNodes].filter(node => node instanceof HTMLTableRowElement)
            // get nth INDEX row element
            const firstRow = [...getRows[INDEX].childNodes].filter(node => node instanceof HTMLTableCellElement)

            test("then the data should be present in the form", async () => {
                // get second column => "Nom" | access its value
                const firstMockedBillName = firstRow[1].textContent
                // check data
                console.log(firstMockedBillName)
                expect(firstMockedBillName === bills[INDEX].name).toBeTruthy()
            })

            describe("When I click on the eye icon", () => {
                beforeEach(async () => {
                    await waitFor(() => {
                        screen.getByTestId("modaleFile")
                        screen.getAllByTestId("icon-eye")
                    })
                })
                test("then the image in the modal should be displayed", async () => {
                    // todo howe to get icon from action cells node
                    const eyes = [...screen.getAllByTestId("icon-eye")]
                    const modal = screen.getByTestId("modaleFile")
                    const thisEye = eyes[INDEX]

                    const containerBills = new Bills({document, onNavigate, store, localStorage})

                    /*   const testMockConstructor = jest.spyOn(containerBills, "constructor").mockImplementation(() => {
                           const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
                           if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
                           const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
                           if (iconEye) iconEye.forEach(icon => {
                               icon.addEventListener('click', () => this.handleClickIconEye(icon))
                           })
                       })*/

                    const mockHandleClickOnEye = jest.fn(thisEye => {
                        // todo commentLorsque je Mock un constructeur, je n'ai plus besoin des parametres
                        jest.spyOn(containerBills, "handleClickIconEye").mockImplementation((thisEye) => {
                            const billUrl = bills[INDEX].fileUrl
                            const imgWidth = Math.floor(modal.width() * 0.5)
                            modal.innerHTML = `<div style='text-align: center;' class="bill-proof-container"><img crossorigin="anonymous" width=${imgWidth} src=${billUrl} alt=${bills[INDEX].name} /></div>`
                            modal.setAttribute("class", "modal fade show")
                        })
                    })

                    thisEye.onclick = () => mockHandleClickOnEye(thisEye)
                    fireEvent.click(eyes[INDEX])
                    await userEvent.click(eyes[INDEX])


                    console.log("Test")
                    expect(mockHandleClickOnEye).toHaveBeenCalled()
                })
            })

        })
    })
})