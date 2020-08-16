import React from 'react';
import { render, fireEvent, wait, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"
import App from './App';
import DiaSemana from './components/DiaSemana';
import axios from 'axios'
import userEvent from '@testing-library/user-event'


axios.get = jest.fn().mockResolvedValue({data: []});
axios.post = jest.fn().mockResolvedValue();
axios.put = jest.fn().mockResolvedValue();

const criarTArefa = () =>{
  const utils = render(<App />)
  const input = utils.getByPlaceholderText(/Insira sua Tarefa/)
  const botao = utils.getByText(/Criar/)
  fireEvent.change(input, {
    target: {
      value: 'tarefa teste'
    }
  })
  fireEvent.click(botao)
  return utils
}

describe("Renderização inicial", () =>{
  test("Input texto aparece na tela", ()=>{
    const { getByPlaceholderText } = render(<App />)
    const input = getByPlaceholderText(/Insira sua Tarefa/)
    expect(input).toBeInTheDocument()
  })

  test('Renderiza as tarefas iniciais', async () => {
    axios.get = jest.fn().mockResolvedValue({
        data: [
            {
                "id": 1111,
                "text": "tarefa teste",
                "day": "Domingo",
                completa: false,
            }
        ]
    })
    const { findByText } = render(<App />);
    expect(axios.get).toHaveBeenCalled();
    const tarefa = await findByText('tarefa teste');
    expect(tarefa).toBeInTheDocument();
  });

  test("Select aparece na tela", () =>{
    const { getByText } = render(<App />)
    const select = getByText(/Selecione o dia/)
    expect(select).toBeInTheDocument()
  })

  test("Botão Adicionar Tarefa Aparfece na Tela", () =>{
    const { getByText } = render(<App />)
    const botao = getByText(/Criar/)
    expect(botao).toBeInTheDocument()
  })

  test("Componente filho é renderizado na Tela", ()=>{
    const { getByText } = render(<App />)
    const diaSemana = getByText('Domingo')
    expect(diaSemana).toBeInTheDocument()
  })
})

describe("Criação de uma nova tarefa", () =>{
  test("Ao digitar no input, o texto deverá aparecer na tela", () =>{
    const { getByPlaceholderText } = render(<App />)
    const input = getByPlaceholderText(/Insira sua Tarefa/)
    fireEvent.change(input, {
      target:{
        value: 'tarefa teste'
      }
    })
    expect(input).toHaveValue('tarefa teste')
  })

  test('Ao clicar no botão "Criar", o input deve ser limpo', () =>{
    const { getByPlaceholderText } = criarTArefa()
    const input = getByPlaceholderText(/Insira sua Tarefa/)
    expect(input).toHaveValue("")
  })

  test('Cria uma tarefa com sucesso', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: [
        {
          "completa": false,
          "text": "tarefa teste",
          "id": "sYLgZCjyXTwr3G9lqNIP",
          "day": ""
        }
      ]
    })

    axios.post = jest.fn().mockResolvedValue()
    const { getByPlaceholderText, getByText } = render(<App />)
    const input = getByPlaceholderText(/Insira sua Tarefa/)
    await userEvent.type(input, 'tarefa teste')
    expect(input).toHaveValue('tarefa teste')
    const button = getByText(/Criar/)
    userEvent.click(button)

    expect(axios.post).toHaveBeenCalledWith('https://us-central1-labenu-apis.cloudfunctions.net/generic/planner-julian-gislaine', {
      text: 'tarefa teste',
      completa: false,
      day: ''
    })

    await wait(() => expect(axios.get).toHaveBeenCalledTimes(3))
  })
})


describe("Maracar tarefas como completas", () =>{
test('Quando clica numa Tarefa, ela deve ser riscada', async () =>{
  axios.get = jest.fn().mockResolvedValue({
        data: [
            {
                "id": 1111,
                "text": "tarefa teste",
                "day": "Domingo",
                completa: false,
            }
        ]
    })
    const { findByText } = render(<App />);
    const tarefa = findByText(/tarefa teste/i)
    userEvent.click(tarefa)
    expect(tarefa).toHaveStyle('text-decoration: line-through')
  });

  test('Quando clica numa Tarefa 2 vezes, ela deve  deixar de ser riscada', async () =>{
    axios.get = jest.fn().mockResolvedValue({
        data: [
            {
                "id": "1111",
                "text": "Tarefa Teste",
                "day": "Domingo",
                completa: false
            }
        ]
    })
    const { getByText } = render(<App />)
    const tarefa = getByText(/tarefa teste/i)
    fireEvent.click(tarefa)
    fireEvent.click(tarefa)
    expect(tarefa).toHaveStyle('text-decoration: none')
  });

  test('Quando uma tarefa é clicada, deve-se bater na API como completa', async () =>{
     axios.get = jest.fn().mockResolvedValue({
        data: [
            {
                "id": "1111",
                "text": "Tarefa Teste",
                "day": "Domingo",
                completa: false
            }
        ]
    })
    axios.put = jest.fn().mockResolvedValue()
    const { getByText } = render(<App />)
    const tarefa = getByText(/tarefa teste/i)
    fireEvent.click(tarefa)

    expect(axios.put).toHaveBeenCalledWith(`https://us-central1-labenu-apis.cloudfunctions.net/generic/planner-julian-gislaine/1111`, {
      completa: true
    });
    
    await wait(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await wait(() => expect(axios.put).toHaveBeenCalledTimes(1));

  }) 

})

