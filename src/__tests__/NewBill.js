/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"

import {ROUTES_PATH} from "../constants/routes.js";
import {loadRoutes} from "./Bills.js";
import {mockErrorNewBill, mockValidNewBill} from "../fixtures/newBill.js";
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import Bills from "../containers/Bills.js";
import store from "../app/Store.js";

const mockBills = jest.mock(Bills)
describe ('Bills, ',() => {

    beforeAll(async () => {
        await loadRoutes(ROUTES_PATH.NewBill)
    })
    beforeEach(() => mockBills.clearAllMocks())


    describe("Given, I am connected as a user", () => {
        console.log(mockBills)
    })
})

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

describe('Given I am on NewBills page', () => {
    beforeEach(async () => {
        await loadRoutes(ROUTES_PATH.NewBill)
    })
    describe("When the page is loaded", () => {
        test("Then the Mail icon should be highlighted", async () => {
            await waitFor(() => screen.getByTestId('icon-mail'))
            const mailIcon = screen.getByTestId('icon-mail')
            expect(mailIcon.classList.contains("active-icon")).toBe(true)
        })
        test('All fields should exist', async () => {
            // await loadRoutes(ROUTES_PATH.NewBill)
            const {type, name, date, price, tax1, tax2, comment, file, submitBtn} = await getFields();
            expect(type).toBeTruthy()
            expect(name).toBeTruthy()
            expect(date).toBeTruthy()
            expect(price).toBeTruthy()
            expect(tax1).toBeTruthy()
            expect(tax2).toBeTruthy()
            expect(comment).toBeTruthy()
            expect(file).toBeTruthy()
            expect(submitBtn).toBeTruthy()
        })
    })
    describe("All fields are filled by User", () => {
        describe("When I add a new picture which is [.jpg, jpeg, .png] ", () => {
            test.todo("Then I have no error")
        })
        describe("When I send the form, but all inputs are not filled", () => {
            test.todo("Then I should get a feedback message")
        })
        describe("When i add a valid image file extension", () => {
            test("Then submit method should be truthy", async () => {
                const onNavigate = () => window.onNavigate(ROUTES_PATH['Bills'])
                const newBills = new NewBill({document, onNavigate, store, localStorage})

                const validImgExtension = mockValidNewBill.fileName.split(".")[1]
                const errorImgExtension = mockErrorNewBill.fileName.split(".")[1]

                const mockSubmitForm = jest.fn((extension) => {
                    try {
                        newBills.isValidExtension(extension)
                    }
                    catch (e) {
                        throw new Error(e)
                    }
                })

                expect(() => mockSubmitForm(validImgExtension)).not.toThrowError()
                expect(() => mockSubmitForm(errorImgExtension)).toThrowError()
            })

        })
        describe("the form is valid is sent", () => {
            test("Then I should navigate back to the Bills page", async () => {
                const onNavigate = () => window.onNavigate(ROUTES_PATH['Bills'])
                const newBills = new NewBill({document, onNavigate, store, localStorage})


                await waitFor(() => screen.getByTestId("form-new-bill"))
                await waitFor(() => screen.getByTestId("btn-send-bill"))

                const form = screen.getByTestId("form-new-bill")
                const submitBtn = screen.getByTestId("btn-send-bill")

                const mockSubmitForm = jest.fn(() => {
                    console.table(window.location)
                    newBills.updateBill(mockValidNewBill)
                    newBills.onNavigate(ROUTES_PATH['Bills'])
                    console.table(window.location)
                })

                form.onsubmit = (e) => {
                    e.preventDefault()
                    mockSubmitForm()
                }

                submitBtn.onclick = (e) => {
                    console.log("click")
                    form.onsubmit(e)
                }

                await userEvent.click(submitBtn)
                expect(window.location.hash === "#employee/bills").toBeTruthy()
            })
        })
    })
})